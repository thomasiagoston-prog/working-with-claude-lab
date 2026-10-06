const fs = require('fs');
const { loadApp, APP_PATH } = require('./setup/loadApp');

function click(document, id) {
  document.getElementById(id).dispatchEvent(new window.Event('click', { bubbles: true }));
}

function theme(document) {
  return document.documentElement.getAttribute('data-theme');
}

afterEach(() => {
  delete window.matchMedia;
});

describe('theme toggle (TODO-231)', () => {
  test('AC-4: starts dark when nothing is stored, even if the OS prefers light', async () => {
    window.matchMedia = jest.fn(() => ({ matches: true, addListener() {}, removeListener() {} }));
    const { document } = await loadApp();
    expect(theme(document)).toBe('dark');
    expect(document.getElementById('theme-toggle').textContent).toBe('Light theme');
    expect(window.matchMedia).not.toHaveBeenCalled();
  });

  test('AC-1: the header toggle switches dark, light, dark and names the theme you will get', async () => {
    const { document } = await loadApp();
    const toggle = document.getElementById('theme-toggle');
    expect(document.getElementById('app-header').contains(toggle)).toBe(true);

    click(document, 'theme-toggle');
    expect(theme(document)).toBe('light');
    expect(toggle.textContent).toBe('Dark theme');
    // The label names the action, so the button is not a pressed/unpressed toggle:
    // aria-pressed would contradict the label for screen readers.
    expect(toggle.hasAttribute('aria-pressed')).toBe(false);

    click(document, 'theme-toggle');
    expect(theme(document)).toBe('dark');
    expect(toggle.textContent).toBe('Light theme');
    expect(toggle.hasAttribute('aria-pressed')).toBe(false);
  });

  test('AC-3: the choice is saved to localStorage and restored on the next load', async () => {
    const first = await loadApp();
    click(first.document, 'theme-toggle');
    expect(window.localStorage.getItem(first.module.THEME_KEY)).toBe('light');

    const second = await loadApp({ storedTheme: 'light' });
    expect(theme(second.document)).toBe('light');
    expect(second.document.getElementById('theme-toggle').textContent).toBe('Dark theme');
  });

  test('AC-2: app.js contains no colour values', () => {
    const source = fs.readFileSync(APP_PATH, 'utf8');
    expect(source).not.toMatch(/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/);
    expect(source).not.toMatch(/\brgba?\(/);
  });
});
