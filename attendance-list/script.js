(() => {
  "use strict";

  const GROUPS_KEY = "attendance.groups";
  const ACTIVE_GROUP_KEY = "attendance.activeGroup";
  const STATUSES = ["present", "late", "absent"];
  const STATUS_LABELS = { present: "Presente", late: "Retardo", absent: "Ausente" };
  const EXAMPLE_NAMES = ["Ana Torres", "Luis Pérez", "Mariana Gómez", "Diego Ramírez"];

  const dateInput = document.getElementById("attendance-date");
  const searchInput = document.getElementById("search-input");
  const addForm = document.getElementById("add-student-form");
  const nameInput = document.getElementById("student-name-input");
  const listBody = document.getElementById("student-list");
  const emptyState = document.getElementById("empty-state");
  const markAllPresentBtn = document.getElementById("mark-all-present");
  const resetDayBtn = document.getElementById("reset-day");
  const exportCsvBtn = document.getElementById("export-csv");

  const groupSelect = document.getElementById("group-select");
  const addGroupBtn = document.getElementById("add-group-btn");
  const deleteGroupBtn = document.getElementById("delete-group-btn");

  const importPdfBtn = document.getElementById("import-pdf-btn");
  const pdfInput = document.getElementById("pdf-input");
  const importPanel = document.getElementById("import-panel");
  const importPanelSub = document.getElementById("import-panel-sub");
  const importGroupName = document.getElementById("import-group-name");
  const groupNameOptions = document.getElementById("group-name-options");
  const importList = document.getElementById("import-list");
  const importCancelBtn = document.getElementById("import-cancel");
  const importConfirmBtn = document.getElementById("import-confirm");

  const summaryTotal = document.getElementById("summary-total");
  const summaryPresent = document.getElementById("summary-present");
  const summaryLate = document.getElementById("summary-late");
  const summaryAbsent = document.getElementById("summary-absent");
  const summaryRate = document.getElementById("summary-rate");

  const todayIso = () => new Date().toISOString().slice(0, 10);
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id${Date.now()}${Math.random()}`);

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

  const makeGroup = (name, students = []) => ({ id: uid(), name, students, records: {} });

  let groups = loadJson(GROUPS_KEY, null);
  if (!Array.isArray(groups) || groups.length === 0) {
    groups = [makeGroup("Ejemplo", EXAMPLE_NAMES.map((name) => ({ id: uid(), name, example: true })))];
  }

  let activeGroupId = loadJson(ACTIVE_GROUP_KEY, null);
  if (!groups.some((g) => g.id === activeGroupId)) {
    activeGroupId = groups[0].id;
  }

  let searchTerm = "";

  const activeGroup = () => groups.find((g) => g.id === activeGroupId) || groups[0];
  const currentDate = () => dateInput.value || todayIso();

  const persistGroups = () => saveJson(GROUPS_KEY, groups);
  const persistActiveGroup = () => saveJson(ACTIVE_GROUP_KEY, activeGroupId);

  const setActiveGroup = (id) => {
    activeGroupId = id;
    persistActiveGroup();
    render();
  };

  const addGroup = (rawName) => {
    const name = rawName.trim();
    if (!name) return null;
    const existing = groups.find((g) => g.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const group = makeGroup(name);
    groups.push(group);
    persistGroups();
    return group;
  };

  const deleteActiveGroup = () => {
    if (groups.length <= 1) return;
    groups = groups.filter((g) => g.id !== activeGroupId);
    activeGroupId = groups[0].id;
    persistGroups();
    persistActiveGroup();
    render();
  };

  const getStatus = (date, studentId) => (activeGroup().records[date] || {})[studentId] || null;

  const setStatus = (date, studentId, status) => {
    const group = activeGroup();
    if (!group.records[date]) group.records[date] = {};
    if (group.records[date][studentId] === status) {
      delete group.records[date][studentId];
    } else {
      group.records[date][studentId] = status;
    }
    persistGroups();
    render();
  };

  const addStudent = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    activeGroup().students.push({ id: uid(), name: trimmed });
    persistGroups();
    render();
  };

  const removeStudent = (id) => {
    const group = activeGroup();
    group.students = group.students.filter((s) => s.id !== id);
    Object.values(group.records).forEach((day) => delete day[id]);
    persistGroups();
    render();
  };

  const markAllPresent = () => {
    const group = activeGroup();
    const date = currentDate();
    group.records[date] = group.records[date] || {};
    group.students.forEach((s) => {
      group.records[date][s.id] = "present";
    });
    persistGroups();
    render();
  };

  const resetDay = () => {
    const group = activeGroup();
    delete group.records[currentDate()];
    persistGroups();
    render();
  };

  const exportCsv = () => {
    const group = activeGroup();
    const date = currentDate();
    const rows = [["Alumno", "Estado", "Fecha", "Grupo"]];
    group.students.forEach((s) => {
      const status = getStatus(date, s.id);
      rows.push([s.name, status ? STATUS_LABELS[status] : "Sin registrar", date, group.name]);
    });
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asistencia_${slugify(group.name)}_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const slugify = (text) =>
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "grupo";

  // --- PDF import ---------------------------------------------------------

  const HEADER_WORD_PATTERN = /\b(lista|asistencia|grupo|grado|escuela|profesor|profesora|maestro|maestra|fecha|salón|salon|nombre|alumno|alumnos|matr[íi]cula|periodo|ciclo|control|escolar|universidad|facultad|plan|materia|turno|secci[oó]n|op|faltas|calificaciones|n[uú]mero)\b/i;

  const cleanDetectedLine = (raw) =>
    raw
      .replace(/^\s*\d+\s*[.)\-:]?\s*/, "") // leading numbering: "1.", "1)", "1-"
      .replace(/^\s*[•\-*]\s*/, "") // leading bullet
      .replace(/\s{2,}/g, " ")
      .trim();

  const looksLikeName = (line) => {
    if (line.length < 3 || line.length > 60) return false;
    const letters = line.replace(/[^\p{L}]/gu, "");
    return letters.length >= 3;
  };

  const suggestedGroupName = (fileName) =>
    fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "Grupo nuevo";

  const extractLinesFromPdf = async (file) => {
    if (!window.pdfjsLib) {
      throw new Error("No se pudo cargar el lector de PDF (revisa tu conexión a internet) e inténtalo de nuevo.");
    }
    if (window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    const rawLines = [];
    let current = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      content.items.forEach((item) => {
        current += item.str;
        if (item.hasEOL) {
          rawLines.push(current);
          current = "";
        } else if (item.str) {
          current += " ";
        }
      });
      if (current.trim()) {
        rawLines.push(current);
        current = "";
      }
    }
    return rawLines.map(cleanDetectedLine).filter(looksLikeName);
  };

  const namesInGroupNamed = (name) => {
    const group = groups.find((g) => g.name.toLowerCase() === name.trim().toLowerCase());
    return new Set((group ? group.students : []).map((s) => s.name.trim().toLowerCase()));
  };

  const refreshGroupNameOptions = () => {
    groupNameOptions.innerHTML = "";
    groups.forEach((g) => {
      const option = document.createElement("option");
      option.value = g.name;
      groupNameOptions.appendChild(option);
    });
  };

  const openImportPanel = (lines, fileName) => {
    importList.innerHTML = "";
    refreshGroupNameOptions();
    importGroupName.value = suggestedGroupName(fileName);
    renderImportItems(lines);
    importPanel.hidden = false;
  };

  const renderImportItems = (lines) => {
    importList.innerHTML = "";
    const known = namesInGroupNamed(importGroupName.value);

    if (lines.length === 0) {
      importPanelSub.textContent = "No se detectó texto reconocible en el PDF. Prueba con otro archivo o agrega a los alumnos manualmente.";
      importConfirmBtn.disabled = true;
    } else {
      importPanelSub.textContent = `Se detectaron ${lines.length} línea(s). Desmarca lo que no sea un alumno, ajusta el grupo y confirma.`;
      importConfirmBtn.disabled = false;
    }

    lines.forEach((line, i) => {
      const isDuplicate = known.has(line.toLowerCase());
      const maybeHeader = HEADER_WORD_PATTERN.test(line);

      const li = document.createElement("li");
      li.className = `import-item${maybeHeader ? " maybe-header" : ""}${isDuplicate ? " duplicate" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `import-item-${i}`;
      checkbox.checked = !maybeHeader && !isDuplicate;
      checkbox.dataset.line = line;

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = line;
      label.style.flex = "1";

      li.appendChild(checkbox);
      li.appendChild(label);

      if (isDuplicate) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "ya está en ese grupo";
        li.appendChild(tag);
      } else if (maybeHeader) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "¿encabezado?";
        li.appendChild(tag);
      }

      importList.appendChild(li);
    });
  };

  const closeImportPanel = () => {
    importPanel.hidden = true;
    importList.innerHTML = "";
    pdfInput.value = "";
  };

  const confirmImport = () => {
    const checked = Array.from(importList.querySelectorAll('input[type="checkbox"]:checked'));
    if (checked.length === 0) {
      closeImportPanel();
      return;
    }
    const group = addGroup(importGroupName.value || "Grupo nuevo");
    if (!group) {
      closeImportPanel();
      return;
    }
    const known = new Set(group.students.map((s) => s.name.trim().toLowerCase()));
    checked.forEach((checkbox) => {
      const name = checkbox.dataset.line.trim();
      if (!name || known.has(name.toLowerCase())) return;
      group.students.push({ id: uid(), name });
      known.add(name.toLowerCase());
    });
    persistGroups();
    setActiveGroup(group.id);
    closeImportPanel();
  };

  // --- Rendering -----------------------------------------------------------

  const renderGroupSelect = () => {
    groupSelect.innerHTML = "";
    groups.forEach((g) => {
      const option = document.createElement("option");
      option.value = g.id;
      option.textContent = `${g.name} (${g.students.length})`;
      groupSelect.appendChild(option);
    });
    groupSelect.value = activeGroupId;
    deleteGroupBtn.disabled = groups.length <= 1;
  };

  const renderSummary = () => {
    const group = activeGroup();
    const date = currentDate();
    const dayRecord = group.records[date] || {};
    const total = group.students.length;
    let present = 0, late = 0, absent = 0;
    group.students.forEach((s) => {
      const status = dayRecord[s.id];
      if (status === "present") present++;
      else if (status === "late") late++;
      else if (status === "absent") absent++;
    });
    const rate = total === 0 ? 0 : Math.round(((present + late) / total) * 100);

    summaryTotal.textContent = total;
    summaryPresent.textContent = present;
    summaryLate.textContent = late;
    summaryAbsent.textContent = absent;
    summaryRate.textContent = `${rate}%`;
  };

  const render = () => {
    const group = activeGroup();
    const date = currentDate();
    const filtered = group.students.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    renderGroupSelect();

    listBody.innerHTML = "";
    emptyState.style.display = group.students.length === 0 ? "block" : "none";

    filtered.forEach((student, index) => {
      const status = getStatus(date, student.id);
      const tr = document.createElement("tr");

      const tdIndex = document.createElement("td");
      tdIndex.className = "col-index";
      tdIndex.textContent = index + 1;

      const tdName = document.createElement("td");
      tdName.className = "col-name";
      tdName.textContent = student.name;
      if (student.example) {
        const tag = document.createElement("span");
        tag.className = "name-tag";
        tag.textContent = "ejemplo";
        tdName.appendChild(tag);
      }

      const tdStatus = document.createElement("td");
      tdStatus.className = "col-status";
      const group2 = document.createElement("div");
      group2.className = "status-group";
      STATUSES.forEach((s) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `status-btn ${s}${status === s ? " active" : ""}`;
        btn.textContent = STATUS_LABELS[s];
        btn.addEventListener("click", () => setStatus(date, student.id, s));
        group2.appendChild(btn);
      });
      tdStatus.appendChild(group2);

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

  groupSelect.addEventListener("change", (e) => setActiveGroup(e.target.value));
  addGroupBtn.addEventListener("click", () => {
    const name = prompt("Nombre del nuevo grupo:");
    if (!name) return;
    const group = addGroup(name);
    if (group) setActiveGroup(group.id);
  });
  deleteGroupBtn.addEventListener("click", () => {
    if (confirm(`¿Eliminar el grupo "${activeGroup().name}" y a todos sus alumnos?`)) deleteActiveGroup();
  });

  markAllPresentBtn.addEventListener("click", markAllPresent);
  resetDayBtn.addEventListener("click", () => {
    if (confirm("¿Reiniciar la asistencia de este día?")) resetDay();
  });
  exportCsvBtn.addEventListener("click", exportCsv);

  importPdfBtn.addEventListener("click", () => pdfInput.click());
  pdfInput.addEventListener("change", async () => {
    const file = pdfInput.files[0];
    if (!file) return;
    importPdfBtn.disabled = true;
    try {
      const lines = await extractLinesFromPdf(file);
      openImportPanel(lines, file.name);
    } catch (err) {
      alert(err.message || "No se pudo leer el PDF. Intenta con otro archivo.");
      pdfInput.value = "";
    } finally {
      importPdfBtn.disabled = false;
    }
  });
  importCancelBtn.addEventListener("click", closeImportPanel);
  importConfirmBtn.addEventListener("click", confirmImport);

  dateInput.value = todayIso();
  render();
})();
