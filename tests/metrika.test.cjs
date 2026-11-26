const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/metrika.js'), 'utf8');

function preview(id, hostname = 'shahmen2088.github.io', pathname = '/professional-portfolio/') {
  const loaded = [];
  const win = { location: { hostname, pathname } };
  const doc = {
    currentScript: { getAttribute: () => id },
    querySelector: () => loaded.find(s => s.src.startsWith('https://mc.yandex.ru/metrika/tag.js?id=')) || null,
    createElement: tag => ({ tagName: tag }),
    head: { appendChild: item => loaded.push(item) },
  };
  const context = vm.createContext({ window: win, document: doc });
  vm.runInContext(script, context);
  return { win, loaded, context };
}

test('missing or invalid IDs send no requests', () => {
  for (const id of [null, '', '0', '-1', 'abc', '12.5', '9007199254740992']) {
    const result = preview(id);
    assert.equal(result.loaded.length, 0);
    assert.equal(result.win.ym, undefined);
  }
});

test('local previews and unrelated sites are not tracked', () => {
  for (const [host, url] of [['localhost', '/'], ['127.0.0.1', '/professional-portfolio/'], ['example.com', '/professional-portfolio/'], ['shahmen2088.github.io', '/another-project/']]) {
    const result = preview('12345678', host, url);
    assert.equal(result.loaded.length, 0);
    assert.equal(result.win.ym, undefined);
  }
});

test('approved public pages initialize one asynchronous counter without replay', () => {
  for (const url of ['/professional-portfolio/', '/professional-portfolio/index.html', '/professional-portfolio/resume.html']) {
    const { win, loaded } = preview('12345678', undefined, url);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].src, 'https://mc.yandex.ru/metrika/tag.js?id=12345678');
    assert.equal(loaded[0].async, true);
    const [id, command, options] = [...win.ym.a[0]];
    assert.equal(id, 12345678);
    assert.equal(command, 'init');
    assert.equal(options.webvisor, false);
    assert.equal(options.trackHash, false);
    assert.equal(options.trackLinks, true);
    assert.equal(options.accurateTrackBounce, true);
    assert.equal(options.userParams, undefined);
  }
});

test('duplicate inclusion does not load or initialize analytics twice', () => {
  const { win, loaded, context } = preview('12345678');
  vm.runInContext(script, context);
  assert.equal(loaded.length, 1);
  assert.equal(win.ym.a.length, 1);
});

test('adding analytics preserves all approved HTML and the portrait', () => {
  const hashes = {
    'index.html': 'fe21673a069faae69ab32f23eec672f4058afc1483bb7eb98a5df432cc8d0f84',
    'resume.html': 'c7bfc172a9f512b6551f242f15af572e840064d3585b6983b740932fde4651f4',
  };
  for (const [name, hash] of Object.entries(hashes)) {
    const original = fs.readFileSync(path.join(root, name), 'utf8');
    const inclusion = /<script defer src="assets\/metrika\.js" data-counter-id="\d+"><\/script>/g;
    assert.equal([...original.matchAll(inclusion)].length, 1, `${name} must include analytics once`);
    const restored = original.replace(inclusion, '');
    assert.equal(crypto.createHash('sha256').update(restored).digest('hex'), hash, `${name}: unrelated content changed`);
  }
  const portrait = fs.readFileSync(path.join(root, 'assets/portrait.png'));
  assert.equal(crypto.createHash('sha256').update(portrait).digest('hex'), 'dfd08e2ef7f00e0872608a94485de5de39592ede7ad329a493c743073e973d38');
});
