// Injected on demand (shortcut or right-click) into any page: rewrites the selected text.
import { fixLayout, fixPersian } from '../core/text.ts';

(window as any).__khFix = (mode: 'layout' | 'persian') => {
  const fix = mode === 'layout' ? fixLayout : fixPersian;
  const el = document.activeElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const { selectionStart: a, selectionEnd: b } = el;
    if (a === null || b === null) return;
    // No selection: fix the whole field.
    const [from, to] = a === b ? [0, el.value.length] : [a, b];
    el.setRangeText(fix(el.value.slice(from, to)), from, to, 'select');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  const text = getSelection()?.toString();
  // insertText goes through the editor's own input handling (Notion, Gmail, Slack all accept it).
  if (text) document.execCommand('insertText', false, fix(text));
};
