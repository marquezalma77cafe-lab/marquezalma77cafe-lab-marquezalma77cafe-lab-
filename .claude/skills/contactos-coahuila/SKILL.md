---
name: contactos-coahuila
description: Busca, verifica y organiza correos electrónicos institucionales, teléfonos y titulares de instituciones, órganos y organismos de gobierno, seguridad pública, medio ambiente y sector productivo en Coahuila, para ofertar cursos de Derecho Parlamentario y la Maestría en Derecho Ambiental, Tecnologías Emergentes y Seguridad Pública. Úsala cuando se pida armar una base de prospectos, directorio de contactos, lista de correos o campaña de difusión académica dirigida a dependencias, Congreso, municipios, policías, fiscalía, empresas, gerentes o directores en Coahuila.
---

# Contactos institucionales en Coahuila para oferta académica

Objetivo: construir una base de contactos **verificada, institucional y lícita** para difundir:

1. **Cursos de Derecho Parlamentario** → Poder Legislativo, cabildos, áreas jurídicas y de enlace legislativo.
2. **Maestría en Derecho Ambiental, Tecnologías Emergentes y Seguridad Pública** → dependencias ambientales, seguridad pública, procuración de justicia, áreas de TI/ciberseguridad y gerentes/directores de medio ambiente, seguridad y legal en empresas.

## Flujo de trabajo

1. **Definir el segmento.** Pregunta (si no está claro) qué programa se oferta y a qué segmento: Legislativo, Seguridad, Ambiental, Municipal, Judicial, Empresarial, Tecnología. Consulta `references/segmentos-y-perfiles.md` para saber qué cargos buscar en cada uno.
2. **Elegir fuentes oficiales primero.** Usa `references/fuentes-oficiales.md`. Orden de prioridad:
   1. Directorio del propio sitio oficial de la institución.
   2. Obligaciones de transparencia (fracción de "directorio de servidores públicos": nombre, cargo, teléfono, correo institucional) en Coahuila Transparente, el sitio de la institución o la Plataforma Nacional de Transparencia.
   3. Directorio general del Gobierno del Estado (`coahuila.gob.mx/directorio`).
   4. Cámaras, colegios y clústeres (para sector privado).
   5. Solo como apoyo: notas de prensa o redes sociales oficiales para confirmar quién es el titular actual.
3. **Buscar.** Con WebSearch/WebFetch usa consultas como:
   - `site:congresocoahuila.gob.mx diputados correo`
   - `site:coahuilatransparente.gob.mx directorio servidores públicos <dependencia>`
   - `"<nombre de la institución>" Coahuila directorio teléfono`
   - `"gerente de medio ambiente" OR "EHS" Coahuila <empresa>` (para empresas, dirigir al correo corporativo o de contacto, no a correos personales)
   - `<municipio> Coahuila ayuntamiento directorio regidores`
4. **Verificar cada dato** (ver "Reglas de calidad"). Marca cada registro con estatus `verificado`, `por confirmar` o `genérico`.
5. **Entregar** en el formato de `references/plantilla-contactos.csv` (una fila por contacto). Si el usuario lo pide, genera además un .xlsx con una hoja por segmento.
6. **Recomendar estrategia** de contacto (ver `references/estrategia-difusion.md`) y, si se pide, redactar el correo de oferta.

## Reglas de calidad

- **Nunca inventes** correos, teléfonos ni nombres. Si no aparece en una fuente, deja la celda vacía y escribe en `notas` qué buscar. No deduzcas correos por patrón (p. ej. `nombre.apellido@dominio`) salvo que el usuario lo pida expresamente, y en ese caso márcalo `por confirmar (inferido)`.
- Cada registro debe llevar **URL de la fuente** y **fecha de consulta**.
- Los titulares cambian con frecuencia (cambios de administración, legislaturas, cabildos). Comprueba que la fuente sea reciente; si el directorio es de años anteriores, márcalo `por confirmar`.
- Calendario a considerar: el Congreso de Coahuila se renueva por elección; tras la elección de 2026 la nueva legislatura entra en funciones al iniciar 2027, así que conviene tener contactos tanto de la legislatura saliente como de diputados electos y del personal técnico permanente (Secretaría de Servicios Parlamentarios, institutos de investigación legislativa, áreas jurídicas), que suele cambiar menos.
- Las denominaciones de dependencias cambian (p. ej. la Secretaría de Medio Ambiente usa `sma.gob.mx`; el antiguo órgano de transparencia ICAI hoy aparece como INTRAC). Confirma el nombre vigente en el sitio oficial.
- Prefiere **correos institucionales de área** (unidad de capacitación, recursos humanos, enlace, oficialía de partes, dirección jurídica) además del correo del titular: suelen responder más a propuestas de capacitación.

## Reglas legales y éticas (obligatorias)

- Solo datos **públicos e institucionales**: los que la institución publica por obligación de transparencia o en su propio sitio. No recopilar correos o teléfonos personales, direcciones particulares ni datos de familiares.
- Para seguridad pública: **no** buscar ni listar datos de elementos operativos, mandos cuya identidad esté reservada, ubicaciones de operativos ni información reservada. Dirigir la oferta a áreas administrativas, academias/institutos de formación, profesionalización, recursos humanos y comunicación social.
- En empresas, usar canales corporativos (contacto, recursos humanos, capacitación, LinkedIn de la empresa). Los datos personales de particulares están protegidos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares; toda comunicación debe identificar a la institución remitente, el propósito y ofrecer una forma sencilla de darse de baja.
- No hacer envíos masivos no solicitados desde cuentas personales; recomendar una herramienta de email marketing con baja automática y envíos segmentados.

## Salida esperada

1. Tabla/CSV con los contactos (columnas de la plantilla).
2. Resumen: cuántos contactos por segmento, cuántos verificados, huecos pendientes.
3. Siguiente paso recomendado (p. ej. oficio a la unidad de capacitación, propuesta de convenio, webinar gratuito).
