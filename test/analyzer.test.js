/* Tests del motor de análisis. Sin dependencias: node test/analyzer.test.js */
const assert = require('assert');
const { analyze } = require('../src/analyzer');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed++;
    console.error('  ✗ ' + name);
    console.error('    ' + e.message);
  }
}

console.log('Instagram');
test('reel con igshid', () => {
  const r = analyze('https://www.instagram.com/reel/Cx1y2z3aBcD/?igshid=abc123');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.platform, 'instagram');
  assert.strictEqual(r.contentType, 'reel');
  assert.strictEqual(r.contentId, 'Cx1y2z3aBcD');
  assert.strictEqual(r.embedUrl, 'https://www.instagram.com/reel/Cx1y2z3aBcD/embed');
  assert.deepStrictEqual(r.trackingRemoved, ['igshid']);
  assert.ok(!r.cleanUrl.includes('igshid'));
});
test('perfil', () => {
  const r = analyze('instagram.com/alma');
  assert.strictEqual(r.contentType, 'perfil');
  assert.strictEqual(r.username, 'alma');
});
test('post', () => {
  const r = analyze('https://instagram.com/p/ABC123/');
  assert.strictEqual(r.contentType, 'post');
  assert.strictEqual(r.contentId, 'ABC123');
});

console.log('TikTok');
test('video con parámetros', () => {
  const r = analyze('https://www.tiktok.com/@alma/video/7412345678901234567?is_from_webapp=1');
  assert.strictEqual(r.platform, 'tiktok');
  assert.strictEqual(r.contentType, 'video');
  assert.strictEqual(r.username, 'alma');
  assert.strictEqual(r.contentId, '7412345678901234567');
  assert.ok(r.trackingRemoved.includes('is_from_webapp'));
});
test('enlace corto vm', () => {
  const r = analyze('https://vm.tiktok.com/ZMabcd123/');
  assert.strictEqual(r.contentType, 'enlace corto');
});

console.log('YouTube');
test('youtu.be', () => {
  const r = analyze('https://youtu.be/dQw4w9WgXcQ?feature=share');
  assert.strictEqual(r.platform, 'youtube');
  assert.strictEqual(r.contentType, 'video');
  assert.strictEqual(r.contentId, 'dQw4w9WgXcQ');
  assert.strictEqual(r.embedUrl, 'https://www.youtube.com/embed/dQw4w9WgXcQ');
});
test('watch?v=', () => {
  const r = analyze('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s');
  assert.strictEqual(r.contentType, 'video');
  assert.strictEqual(r.contentId, 'dQw4w9WgXcQ');
});
test('shorts', () => {
  const r = analyze('https://www.youtube.com/shorts/abc123XYZ');
  assert.strictEqual(r.contentType, 'short');
  assert.strictEqual(r.contentId, 'abc123XYZ');
});

console.log('X / Twitter');
test('status', () => {
  const r = analyze('https://x.com/nasa/status/1751809439580061850?s=20');
  assert.strictEqual(r.platform, 'twitter');
  assert.strictEqual(r.contentType, 'tweet');
  assert.strictEqual(r.username, 'nasa');
  assert.strictEqual(r.contentId, '1751809439580061850');
  assert.ok(r.trackingRemoved.includes('s'));
});

console.log('Otros / validación');
test('facebook reel', () => {
  const r = analyze('https://www.facebook.com/reel/123456789');
  assert.strictEqual(r.platform, 'facebook');
  assert.strictEqual(r.contentType, 'reel');
});
test('dominio no reconocido', () => {
  const r = analyze('https://example.com/foo');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.platform, 'generic');
  assert.ok(r.warnings.length > 0);
});
test('acortador', () => {
  const r = analyze('https://bit.ly/abc');
  assert.strictEqual(r.isShortener, true);
});
test('vacío', () => {
  const r = analyze('');
  assert.strictEqual(r.ok, false);
});
test('inválido', () => {
  const r = analyze('esto no es una url con espacios');
  assert.strictEqual(r.ok, false);
});
test('utm_* eliminados', () => {
  const r = analyze('https://twitter.com/nasa?utm_source=news&utm_medium=email');
  assert.ok(r.trackingRemoved.includes('utm_source'));
  assert.ok(r.trackingRemoved.includes('utm_medium'));
  assert.ok(!r.cleanUrl.includes('utm_'));
});

console.log('');
console.log(`Resultado: ${passed} pasados, ${failed} fallidos`);
process.exit(failed ? 1 : 0);
