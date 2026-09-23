# Plataforma SNP del posgrado

Aplicación de una sola página para preparar la maestría y el doctorado rumbo al
Sistema Nacional de Posgrados (SECIHTI).

Publicada como Artifact en claude.ai: https://claude.ai/artifact/Ba4NtzHX5WMnxAJvarf3ik

## Módulos

- **Inicio**: ruta de arranque, alertas e indicadores clave por programa.
- **Diagnóstico SNP**: 38 criterios en 8 categorías, con estado, notas, evidencias e indicadores calculados.
- **Programas**: datos generales y ficha de cada programa (LGAC, plazo, metas de la convocatoria).
- **Núcleo académico**: profesores de la facultad y externos, rol, SNII, LGAC y CVU.
- **Estudiantes**: trayectoria y eficiencia terminal por generación.
- **Egresados**: seguimiento laboral.
- **Producción académica** y **Vinculación**.
- **Documentos**: carga de PDFs (bandeja de control escolar) ligados a criterios.
- **Plan de mejora**: acciones con responsable y fecha.

Los datos se guardan en la base de datos del Artifact (`db`) y los archivos en su
almacenamiento (`assets`). El catálogo de criterios es una guía de trabajo: debe
contrastarse con la convocatoria vigente.
