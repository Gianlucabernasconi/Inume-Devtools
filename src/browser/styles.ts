export function getOverlayStyles(): string {
  return `
    :host {
      all: initial;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    .overlay-root {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483000;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #f8fafc;
    }

    button,
    input {
      font: inherit;
    }

    .toggle-button,
    .panel {
      pointer-events: auto;
    }

    .toggle-button {
      position: fixed;
      right: 16px;
      bottom: 16px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: #f8fafc;
      box-shadow: 0 18px 36px rgb(15 23 42 / 0.35);
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
    }

    .toggle-button:focus-visible,
    .panel button:focus-visible,
    .panel input:focus-visible {
      outline: 2px solid #c4b5fd;
      outline-offset: 2px;
    }

    .toggle-badge,
    .dev-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgb(255 255 255 / 0.14);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .panel {
      position: fixed;
      top: 16px;
      right: 16px;
      width: min(360px, calc(100vw - 24px));
      max-height: 70vh;
      display: grid;
      grid-template-rows: auto auto auto minmax(0, 1fr) auto;
      border: 1px solid rgb(255 255 255 / 0.08);
      border-radius: 22px;
      background: rgb(10 14 28 / 0.96);
      box-shadow: 0 28px 60px rgb(2 6 23 / 0.45);
      overflow: hidden;
      backdrop-filter: blur(16px);
    }

    .panel[hidden] {
      display: none;
    }

    .header,
    .editor,
    .search,
    .footer {
      padding: 14px 16px;
      border-bottom: 1px solid rgb(255 255 255 / 0.06);
    }

    .footer {
      border-bottom: 0;
      border-top: 1px solid rgb(255 255 255 / 0.06);
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }

    .header:active {
      cursor: grabbing;
    }

    .header-copy {
      min-width: 0;
    }

    .title {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 800;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ghost-button,
    .primary-button,
    .close-button {
      border: 0;
      border-radius: 999px;
      cursor: pointer;
      padding: 9px 12px;
    }

    .ghost-button,
    .close-button {
      background: rgb(255 255 255 / 0.08);
      color: #f8fafc;
    }

    .primary-button {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: #f8fafc;
      font-weight: 700;
    }

    .editor {
      display: grid;
      gap: 12px;
    }

    .editor-top,
    .editor-actions,
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .editor-top {
      align-items: flex-start;
    }

    .selected-name {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .selected-value,
    .status-text,
    .empty-copy,
    .row-name,
    .search input::placeholder {
      color: rgb(226 232 240 / 0.72);
    }

    .swatch {
      inline-size: 40px;
      block-size: 40px;
      border-radius: 14px;
      border: 1px solid rgb(255 255 255 / 0.12);
      background: #0f172a;
      flex: none;
    }

    .editor-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .editor input[type='color'] {
      inline-size: 54px;
      block-size: 38px;
      border: 0;
      border-radius: 12px;
      padding: 0;
      background: transparent;
      cursor: pointer;
    }

    .editor input[type='color'][disabled] {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .search input {
      width: 100%;
      border: 1px solid rgb(255 255 255 / 0.1);
      border-radius: 12px;
      padding: 10px 12px;
      background: rgb(255 255 255 / 0.04);
      color: #f8fafc;
    }

    .list {
      min-height: 0;
      overflow: auto;
      padding: 10px;
      display: grid;
      gap: 8px;
    }

    .row-button {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 10px;
      width: 100%;
      border: 1px solid transparent;
      border-radius: 14px;
      padding: 10px 12px;
      background: rgb(255 255 255 / 0.03);
      color: #f8fafc;
      cursor: pointer;
      text-align: left;
    }

    .row-button.is-selected {
      border-color: rgb(139 92 246 / 0.7);
      background: rgb(139 92 246 / 0.15);
    }

    .row-swatch {
      inline-size: 14px;
      block-size: 14px;
      border-radius: 999px;
      border: 1px solid rgb(255 255 255 / 0.12);
      background: #0f172a;
    }

    .row-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 600;
    }

    .empty-state {
      display: grid;
      place-items: center;
      min-height: 120px;
      padding: 18px;
      text-align: center;
    }

    .footer {
      align-items: center;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    .close-button {
      inline-size: 34px;
      block-size: 34px;
      display: inline-grid;
      place-items: center;
      padding: 0;
    }

    @media (max-width: 640px) {
      .panel {
        width: min(360px, calc(100vw - 16px));
        right: 8px;
        top: 8px;
        max-height: calc(100vh - 16px);
      }

      .toggle-button {
        right: 12px;
        bottom: 12px;
      }
    }
  `
}
