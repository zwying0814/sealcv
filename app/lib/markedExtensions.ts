import { marked } from 'marked';

// 多列均分（第一行 + 多个 ~ 行）：
// 语法：
// Title line
// ~ Col A
// ~ Col B
// ~ Col C
// 渲染为：<div class="lr"><div class="lr-item">Title</div><div class="lr-item">A</div>...</div>
export function registerEqualSplitRowExtension() {
  const ext = {
    name: 'lrn',
    level: 'block',
    start(src: string) {
      const idx = src.indexOf('\n~');
      return idx === -1 ? src.indexOf('~') : idx;
    },
    tokenizer(src: string) {
      const lines = src.split(/\r?\n/);
      if (lines.length < 2) return;
      const first = lines[0];
      if (!first) return;
      const items = [first.trim()];
      let raw = first;
      let matched = false;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const m = line.match(/^\s*~\s+(.*)$/);
        if (m && m[1]) {
          items.push(m[1].trim());
          raw += '\n' + line;
          matched = true;
        } else {
          break;
        }
      }
      if (!matched) return;
      return {
        type: 'lrn',
        raw,
        items,
      } as any;
    },
    renderer(token: any) {
      const inner = (token.items as string[])
        .map((t) => `<div class="lr-item">${marked.parseInline(t)}</div>`) 
        .join('');
      return `<div class="lr">${inner}</div>`;
    },
  } as any;

  marked.use({ extensions: [ext] });
}

// “% 居中”语法：行首以 % 开头，后面的内容居中显示
// 用法示例：
// % 这是居中内容，支持 **加粗** 和 _斜体_
export function registerCenterLineExtension() {
  const ext = {
    name: 'centerline',
    level: 'block',
    start(src: string) {
      // 寻找行首的 % 标记，提高匹配性能
      const nlIdx = src.indexOf('\n%');
      if (src.startsWith('%')) return 0;
      return nlIdx === -1 ? -1 : nlIdx + 1;
    },
    tokenizer(src: string) {
      // 仅匹配当前行，形如：% 内容
      const m = src.match(/^(?:\s*%\s+)(.+?)(?:\r?\n|$)/);
      if (!m || !m[1]) return;
      return {
        type: 'centerline',
        raw: m[0],
        text: m[1].trim(),
      } as any;
    },
    renderer(token: any) {
      const inner = marked.parseInline(token.text);
      return `<div class="centerline">${inner}</div>`;
    },
  } as any;

  marked.use({ extensions: [ext] });
}

// icon=... 语法：行内匹配并渲染为 <iconify-icon>
export function registerIconInlineExtension() {
  const ext = {
    name: 'iconify-inline',
    level: 'inline',
    start(src: string) {
      return src.indexOf('icon=');
    },
    tokenizer(src: string) {
      const m = src.match(/^icon=([^\s]+)(?:\s+([^\n]+))?/);
      if (!m || !m[1]) return;
      return {
        type: 'iconify-inline',
        raw: m[0],
        icon: m[1].trim(),
        text: (m[2] ?? '').trim(),
      } as any;
    },
    renderer(token: any) {
      const name = token.icon as string;
      const trailing = token.text ? marked.parseInline(token.text) : '';
      return `<p class="icon-line"><iconify-icon icon="${name}" class="${name}"></iconify-icon>${trailing ? `<span class="icon-text">${trailing}</span>` : ''}</p>`;
    },
  } as any;

  marked.use({ extensions: [ext] });
}

export function registerStrongAdjacencyFix() {
  const ext = {
    name: 'strong-adjacency-fix',
    level: 'inline',
    start(src: string) {
      return src.indexOf('**');
    },
    tokenizer(src: string) {
      const m = src.match(/^\*\*(?=\S)([\s\S]*?)\*\*/);
      if (!m) return;
      return {
        type: 'strong-adjacency-fix',
        raw: m[0],
        text: m[1],
      } as any;
    },
    renderer(token: any) {
      const inner = marked.parseInline(token.text);
      return `<strong>${inner}</strong>`;
    },
  } as any;

  marked.use({ extensions: [ext] });
}