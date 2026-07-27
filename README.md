# Analizador de URLs de Redes Sociales

Plataforma para **analizar enlaces de redes sociales**. A partir de una URL detecta
la plataforma, el tipo de contenido, el usuario y el ID; elimina los parámetros de
rastreo y genera una URL canónica limpia y (cuando es posible) una URL de inserción
(embed).

Todo el análisis es **local**: no hace ninguna llamada a servicios externos, así que
funciona sin conexión y sin exponer los enlaces que analizas.

## Qué detecta

| Plataforma      | Tipos de contenido reconocidos                                  |
|-----------------|-----------------------------------------------------------------|
| Instagram       | perfil, post, reel, IGTV, historia                              |
| TikTok          | perfil, video, live, enlaces cortos (`vm.`/`vt.`), hashtag      |
| YouTube         | video, short, directo, playlist, canal, `youtu.be`              |
| X (Twitter)     | perfil, tweet                                                   |
| Facebook        | página, perfil, post, video, reel, grupo, evento, `fb.watch`    |
| Threads         | perfil, post                                                    |
| LinkedIn        | perfil, empresa, post, empleo                                   |
| Pinterest       | perfil, tablero, pin, `pin.it`                                  |
| Reddit          | subreddit, post, usuario, `redd.it`                             |
| Twitch          | canal, VOD, clip                                                |
| Snapchat        | perfil, enlace corto                                            |

Además:

- Elimina **parámetros de rastreo** (`utm_*`, `igshid`, `fbclid`, `feature`, `s`, …)
  y reconstruye una URL limpia.
- Reconoce **acortadores** (bit.ly, t.co, …) y avisa de que el destino no puede
  resolverse sin conexión.
- Genera **URL de embed** para Instagram, TikTok y YouTube.

## Uso

### Interfaz web

```bash
npm install
npm start
# abre http://localhost:3000
```

Pega una URL y pulsa **Analizar**. Hay ejemplos de un clic para probar.

> La interfaz también funciona abriendo `public/index.html` directamente en el
> navegador (el motor de análisis es 100% cliente).

### Archivo autónomo (sin instalar nada)

`plataforma.html` es una versión de **un solo archivo** con todo incluido (estilos
y lógica). Ábrelo directamente en el navegador con doble clic: no necesita servidor
ni dependencias, y no envía ningún enlace a internet. Ideal para usarla al vuelo o
compartirla.

### API

```
GET  /api/analyze?url=<URL>
POST /api/analyze        { "url": "<URL>" }
GET  /api/platforms      lista de plataformas soportadas
GET  /api/health
```

Ejemplo:

```bash
curl "http://localhost:3000/api/analyze?url=https://www.tiktok.com/@alma/video/7412345678901234567?is_from_webapp=1"
```

```json
{
  "ok": true,
  "platform": "tiktok",
  "contentType": "video",
  "username": "alma",
  "contentId": "7412345678901234567",
  "cleanUrl": "https://tiktok.com/@alma/video/7412345678901234567",
  "embedUrl": "https://www.tiktok.com/embed/v2/7412345678901234567",
  "trackingRemoved": ["is_from_webapp"]
}
```

### Como librería

```js
const { analyze } = require('./src/analyzer');
const r = analyze('https://youtu.be/dQw4w9WgXcQ?feature=share');
console.log(r.contentId); // dQw4w9WgXcQ
```

## Estructura

```
src/analyzer.js        Motor de análisis (Node + navegador, sin dependencias)
server.js              Servidor Express: estáticos + API JSON
public/                Interfaz web (HTML, CSS, JS)
test/analyzer.test.js  Tests del motor
```

## Tests

```bash
npm test
```

## Licencia

MIT
