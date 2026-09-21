(() => {
  "use strict";

  const STUDENTS_KEY = "attendance.students";
  const RECORDS_KEY = "attendance.records"; // { [date]: { [studentId]: status } }
  const STATUSES = ["present", "late", "absent"];
  const STATUS_LABELS = { present: "Presente", late: "Retardo", absent: "Ausente" };

  const dateInput = document.getElementById("attendance-date");
  const searchInput = document.getElementById("search-input");
  const addForm = document.getElementById("add-student-form");
  const nameInput = document.getElementById("student-name-input");
  const listBody = document.getElementById("student-list");
  const emptyState = document.getElementById("empty-state");
  const markAllPresentBtn = document.getElementById("mark-all-present");
  const resetDayBtn = document.getElementById("reset-day");
  const exportCsvBtn = document.getElementById("export-csv");

  const summaryTotal = document.getElementById("summary-total");
  const summaryPresent = document.getElementById("summary-present");
  const summaryLate = document.getElementById("summary-late");
  const summaryAbsent = document.getElementById("summary-absent");
  const summaryRate = document.getElementById("summary-rate");

  const todayIso = () => new Date().toISOString().slice(0, 10);

  const loadJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable; state stays in memory for this session */
    }
  };

  let students = loadJson(STUDENTS_KEY, []);
  let records = loadJson(RECORDS_KEY, {});
  let searchTerm = "";

  const currentDate = () => dateInput.value || todayIso();

  const persistStudents = () => saveJson(STUDENTS_KEY, students);
  const persistRecords = () => saveJson(RECORDS_KEY, records);

  const getStatus = (date, studentId) => (records[date] || {})[studentId] || null;

  const setStatus = (date, studentId, status) => {
    if (!records[date]) records[date] = {};
    if (records[date][studentId] === status) {
      delete records[date][studentId];
    } else {
      records[date][studentId] = status;
    }
    persistRecords();
    render();
  };

  const addStudent = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    students.push({ id: crypto.randomUUID(), name: trimmed });
    persistStudents();
    render();
  };

  const removeStudent = (id) => {
    students = students.filter((s) => s.id !== id);
    Object.values(records).forEach((day) => delete day[id]);
    persistStudents();
    persistRecords();
    render();
  };

  const markAllPresent = () => {
    const date = currentDate();
    records[date] = records[date] || {};
    students.forEach((s) => {
      records[date][s.id] = "present";
    });
    persistRecords();
    render();
  };

  const resetDay = () => {
    const date = currentDate();
    delete records[date];
    persistRecords();
    render();
  };

  const exportCsv = () => {
    const date = currentDate();
    const rows = [["Alumno", "Estado", "Fecha"]];
    students.forEach((s) => {
      const status = getStatus(date, s.id);
      rows.push([s.name, status ? STATUS_LABELS[status] : "Sin registrar", date]);
    });
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asistencia_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderSummary = () => {
    const date = currentDate();
    const dayRecord = records[date] || {};
    const total = students.length;
    let present = 0, late = 0, absent = 0;
    students.forEach((s) => {
      const status = dayRecord[s.id];
      if (status === "present") present++;
      else if (status === "late") late++;
      else if (status === "absent") absent++;
    });
    const marked = present + late + absent;
    const rate = total === 0 ? 0 : Math.round(((present + late) / total) * 100);

    summaryTotal.textContent = total;
    summaryPresent.textContent = present;
    summaryLate.textContent = late;
    summaryAbsent.textContent = absent;
    summaryRate.textContent = `${rate}%`;
    void marked;
  };

  const render = () => {
    const date = currentDate();
    const filtered = students.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    listBody.innerHTML = "";
    emptyState.style.display = students.length === 0 ? "block" : "none";

    filtered.forEach((student, index) => {
      const status = getStatus(date, student.id);
      const tr = document.createElement("tr");

      const tdIndex = document.createElement("td");
      tdIndex.className = "col-index";
      tdIndex.textContent = index + 1;

      const tdName = document.createElement("td");
      tdName.className = "col-name";
      tdName.textContent = student.name;

      const tdStatus = document.createElement("td");
      tdStatus.className = "col-status";
      const group = document.createElement("div");
      group.className = "status-group";
      STATUSES.forEach((s) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `status-btn ${s}${status === s ? " active" : ""}`;
        btn.textContent = STATUS_LABELS[s];
        btn.addEventListener("click", () => setStatus(date, student.id, s));
        group.appendChild(btn);
      });
      tdStatus.appendChild(group);

      const tdActions = document.createElement("td");
      tdActions.className = "col-actions";
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-btn";
      removeBtn.title = "Eliminar alumno";
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", () => {
        if (confirm(`¿Eliminar a ${student.name} de la lista?`)) removeStudent(student.id);
      });
      tdActions.appendChild(removeBtn);

      tr.append(tdIndex, tdName, tdStatus, tdActions);
      listBody.appendChild(tr);
    });

    renderSummary();
  };

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addStudent(nameInput.value);
    nameInput.value = "";
    nameInput.focus();
  });

  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    render();
  });

  dateInput.addEventListener("change", render);

  markAllPresentBtn.addEventListener("click", markAllPresent);
  resetDayBtn.addEventListener("click", () => {
    if (confirm("¿Reiniciar la asistencia de este día?")) resetDay();
  });
  exportCsvBtn.addEventListener("click", exportCsv);

  dateInput.value = todayIso();
  render();
})();
