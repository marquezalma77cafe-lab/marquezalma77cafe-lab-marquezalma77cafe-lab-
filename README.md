# CESGP · Centro de Estudios Superiores en Gestión Pública

Sitio web institucional del Centro de Estudios Superiores en Gestión Pública: maestrías, especialidades y doctorado.

Diseño editorial inspirado en harvard.edu, con la paleta institucional verde, dorado y blanco.

## Contenido

- **Héroe con buscador** — buscador en vivo (programas, docentes y artículos) con chips de temas populares, al estilo de la portada de Harvard.
- **Historias destacadas** — parrilla editorial con un artículo principal y lista lateral.
- **Oferta académica** — lista monumental con pestañas (4 maestrías, 4 especialidades, 1 doctorado); cada fila abre una ficha con plan de estudios y perfil de egreso.
- **Claustro de maestros** — carrusel horizontal con 8 perfiles docentes; cada tarjeta abre biografía y líneas de especialización.
- **Blog / tópicos importantes** — parrilla de artículos con filtros por categoría.
- **Comunidad** — agenda de avisos y eventos con fechas grandes, directorio de redes sociales (Facebook, Instagram, LinkedIn, YouTube, X) y suscripción al boletín.
- **Testimonios** — carrusel de citas de egresados.
- **Admisión** — banda de llamado a la acción con formulario de solicitud de información.

## Diseño

- Paleta institucional: verde `#0C4A30`, dorado `#C6A15B` y blanco.
- Tipografías: Playfair Display (títulos serif, estilo editorial) e Inter (texto).
- Totalmente responsivo (móvil, tableta y escritorio), con animaciones de aparición, contadores, modales, buscador superpuesto y portadas SVG generativas en tonos institucionales (sin depender de fotografías externas).

## Cómo publicarlo

Todo el sitio vive en un solo archivo: `index.html` (sin dependencias ni proceso de compilación).

1. Abre `index.html` en cualquier navegador para verlo localmente, o
2. Actívalo en **GitHub Pages**: Settings → Pages → Branch → selecciona la rama y la carpeta raíz (`/`). En unos minutos el sitio quedará en línea.

## Personalización rápida

- **Colores**: edita las variables al inicio del CSS (`--verde`, `--dorado`, etc.).
- **Programas, claustro y blog**: edita los objetos `programas`, `claustro` y `articulos` dentro del `<script>` al final de `index.html`.
- **Avisos**: edita la sección `#avisos` y la cinta superior (`.cinta-pista`).
- **Datos de contacto y redes**: edita el pie de página y la sección `#redes`.
