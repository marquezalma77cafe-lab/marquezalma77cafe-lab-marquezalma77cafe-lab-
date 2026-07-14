# CESGP · Centro de Estudios Superiores en Gestión Pública

Sitio web institucional del Centro de Estudios Superiores en Gestión Pública: maestrías, especialidades y doctorado.

## Contenido

- **Oferta académica** — pestañas interactivas con 4 maestrías, 4 especialidades y 1 doctorado; cada programa abre una ficha con plan de estudios y perfil de egreso.
- **Claustro de maestros** — 8 perfiles docentes con biografía y líneas de especialización.
- **Blog / tópicos importantes** — artículos con filtros por categoría.
- **Avisos** — tablero de comunicados y cinta de avisos animada en la parte superior.
- **Testimonios** — carrusel automático de egresados.
- **Admisión** — preguntas frecuentes (acordeón) y formulario de solicitud de información.
- **Redes sociales** — Facebook, Instagram, LinkedIn, YouTube y X.

## Diseño

- Paleta institucional: verde `#0E5C3A`, dorado `#C6A15B` y blanco, estilo minimalista.
- Tipografías: Cormorant Garamond (títulos) e Inter (texto).
- Totalmente responsivo (móvil, tableta y escritorio), con animaciones de aparición, contadores y modales.

## Cómo publicarlo

Todo el sitio vive en un solo archivo: `index.html` (sin dependencias ni proceso de compilación).

1. Abre `index.html` en cualquier navegador para verlo localmente, o
2. Actívalo en **GitHub Pages**: Settings → Pages → Branch → selecciona la rama y la carpeta raíz (`/`). En unos minutos el sitio quedará en línea.

## Personalización rápida

- **Colores**: edita las variables al inicio del CSS (`--verde`, `--dorado`, etc.).
- **Programas, claustro y blog**: edita los objetos `programas`, `claustro` y `articulos` dentro del `<script>` al final de `index.html`.
- **Avisos**: edita la sección `#avisos` y la cinta superior (`.cinta-pista`).
- **Datos de contacto y redes**: edita el pie de página y la sección `#redes`.
