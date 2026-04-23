export function getOverlayStyles(): string {
  return `
    :host {
      all: initial;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    button,
    input {
      font: inherit;
    }

    .overlay-root {
      --motion-fast: 140ms;
      --motion-base: 180ms;
      --ease-out: cubic-bezier(0.22, 0.8, 0.36, 1);
      --ease-press: cubic-bezier(0.3, 0, 0.2, 1);
      --color-bg: #05070a;
      --color-surface: #0c1216;
      --color-surface-raised: #10171b;
      --color-surface-soft: #121b20;
      --color-surface-ink: #091015;
      --color-border: rgb(98 113 122 / 0.24);
      --color-border-strong: rgb(98 113 122 / 0.42);
      --color-text: #e2ece8;
      --color-text-muted: rgb(226 236 232 / 0.72);
      --color-text-soft: rgb(226 236 232 / 0.54);
      --color-accent: #89bfa5;
      --color-accent-deep: #6d9b85;
      --color-warm: #bda389;
      --color-highlight: #c7ece0;
      --color-shadow: rgb(0 0 0 / 0.72);
      --sprite-accent: #7ab89a;
      --sprite-eye: #2a5a44;
      --font-body: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483000;
      font-family: var(--font-body);
      color: var(--color-text);
    }

    .toggle-button,
    .panel {
      pointer-events: auto;
    }

    .toggle-button:focus-visible,
    .panel button:focus-visible {
      outline: 2px solid rgb(137 191 165 / 0.88);
      outline-offset: 2px;
    }

    .search input:focus-visible,
    .editor-text-input:focus-visible {
      outline: 0;
    }

    .search-field:focus-within,
    .editor-input-shell:focus-within {
      border-color: rgb(137 191 165 / 0.35);
      box-shadow:
        0 0 0 2px rgb(137 191 165 / 0.12),
        inset 0 1px 0 rgb(255 255 255 / 0.04);
    }

    .toggle-button {
      position: fixed;
      right: 16px;
      bottom: 16px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 36px;
      padding: 0 18px 0 14px;
      border: 1px solid rgb(122 184 154 / 0.22);
      border-radius: 999px;
      background:
        linear-gradient(180deg, rgb(18 26 31 / 0.96), rgb(10 14 18 / 0.96)),
        radial-gradient(circle at 18% 50%, rgb(189 163 137 / 0.10), transparent 42%);
      color: var(--color-text-muted);
      box-shadow:
        0 8px 20px -6px var(--color-shadow),
        0 1px 2px rgb(0 0 0 / 0.5),
        inset 0 1px 0 rgb(255 255 255 / 0.04),
        0 0 0 1px rgb(122 184 154 / 0.08),
        0 0 6px 0 rgb(122 184 154 / 0.10);
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1px;
      user-select: none;
      transition:
        box-shadow var(--motion-fast) var(--ease-out),
        border-color var(--motion-fast) ease,
        transform var(--motion-fast) var(--ease-out),
        color var(--motion-fast) ease;
    }

    .toggle-button::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: rgb(122 184 154 / 0.06);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--motion-fast) ease;
    }

    .toggle-button:hover {
      border-color: rgb(122 184 154 / 0.45);
      color: var(--color-text);
      box-shadow:
        0 12px 28px -8px var(--color-shadow),
        0 1px 2px rgb(0 0 0 / 0.55),
        inset 0 1px 0 rgb(255 255 255 / 0.05),
        0 0 0 1px rgb(122 184 154 / 0.10),
        0 0 8px 0 rgb(122 184 154 / 0.14);
      transform: translateY(-1px);
    }

    .toggle-button:hover::after {
      opacity: 1;
    }

    .toggle-button:active {
      transform: scale(0.985);
      transition-duration: 80ms;
    }

    .toggle-button[data-state='open'] {
      box-shadow:
        0 14px 30px -8px var(--color-shadow),
        0 0 0 3px rgb(137 191 165 / 0.18),
        0 0 0 1px rgb(199 236 224 / 0.08) inset;
    }

    .search-icon {
      display: inline-flex;
      color: var(--color-text-soft);
      flex: none;
    }

    .close-button svg,
    .ghost-button svg,
    .primary-button svg,
    .search-icon svg,
    .menu-button svg,
    .feedback-toast svg {
      inline-size: 12px;
      block-size: 12px;
      fill: currentColor;
    }

    .toggle-text {
      white-space: nowrap;
    }

    .panel {
      position: fixed;
      top: 16px;
      right: 16px;
      width: min(352px, calc(100vw - 24px));
      height: min(620px, calc(100vh - 24px));
      display: grid;
      grid-template-rows: auto auto auto minmax(180px, 1fr) auto;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      background:
        radial-gradient(circle at top left, rgb(189 163 137 / 0.06), transparent 30%),
        radial-gradient(circle at top right, rgb(137 191 165 / 0.07), transparent 34%),
        linear-gradient(180deg, rgb(8 11 14 / 0.98), rgb(5 7 10 / 0.98));
      box-shadow:
        0 0 0 0.5px rgb(226 236 232 / 0.04),
        0 20px 50px -12px rgb(0 0 0 / 0.70),
        0 8px 20px -8px rgb(0 0 0 / 0.55);
      overflow: hidden;
      opacity: 1;
      transform: translateY(0) scale(1);
      transform-origin: top right;
      transition:
        opacity var(--motion-base) var(--ease-out),
        transform var(--motion-base) var(--ease-out);
      will-change: opacity, transform;
    }

    .panel[hidden] {
      display: none;
    }

    .panel[data-state='closed'] {
      opacity: 0;
      transform: translateY(8px) scale(.985);
      pointer-events: none;
    }

    .header,
    .editor,
    .search,
    .footer {
      flex-shrink: 0;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 10px 0 12px;
      border-bottom: 1px solid rgb(98 113 122 / 0.16);
      background:
        linear-gradient(180deg, rgb(18 25 29 / 0.96), rgb(10 16 20 / 0.96)),
        radial-gradient(circle at 14% 50%, rgb(189 163 137 / 0.09), transparent 38%);
      cursor: grab;
      user-select: none;
      touch-action: none;
    }

    .header:active {
      cursor: grabbing;
    }

    .header-copy {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .sprite-cat {
      display: block;
      flex: none;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }

    .sprite-cat--header {
      inline-size: 20px;
      block-size: 22px;
      border-radius: 3px;
      margin-right: 2px;
    }

    .sprite-cat--launcher {
      inline-size: 20px;
      block-size: 22px;
      border-radius: 4px;
    }

    .title {
      margin: 0;
      min-width: 0;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      margin-left: auto;
    }

    .editor {
      padding: 12px 12px 14px;
      border-bottom: 1px solid rgb(98 113 122 / 0.18);
      background:
        linear-gradient(180deg, rgb(12 18 22 / 0.98), rgb(10 15 19 / 0.98)),
        radial-gradient(circle at 85% 0%, rgb(137 191 165 / 0.05), transparent 24%);
      display: grid;
      gap: 10px;
    }

    .editor-top,
    .picker-inline,
    .editor-copy {
      display: grid;
      gap: 8px;
    }

    .selected-token {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .swatch,
    .row-swatch {
      position: relative;
      overflow: hidden;
      background:
        linear-gradient(var(--swatch-fill, var(--color-accent)), var(--swatch-fill, var(--color-accent))) 0 0 / 100% 100% no-repeat,
        conic-gradient(#1a2226 0 25%, #11181c 0 50%, #1a2226 0 75%, #11181c 0) 0 0 / 8px 8px;
    }

    .swatch {
      --swatch-fill: var(--color-accent);
      inline-size: 16px;
      block-size: 16px;
      border-radius: 4px;
      box-shadow: 0 0 0 1px rgb(255 255 255 / 0.10), 0 0 0 3px rgb(137 191 165 / 0.20);
      flex: none;
    }

    .selected-name,
    .selected-value,
    .editor-text-input,
    .row-name,
    .search input,
    .search-meta {
      font-family: var(--font-mono);
      letter-spacing: -0.1px;
    }

    .selected-name {
      margin: 0;
      color: var(--color-text);
      font-size: 11.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .selected-value {
      margin: 0;
      color: var(--color-text-soft);
      font-size: 10.5px;
      line-height: 1.35;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .picker-area {
      position: relative;
      height: 108px;
      border-radius: 6px;
      overflow: hidden;
      cursor: crosshair;
      border: 1px solid rgb(255 255 255 / 0.05);
      background: linear-gradient(to top, black, transparent), linear-gradient(to right, white, var(--color-accent));
    }

    .picker-thumb {
      position: absolute;
      inline-size: 10px;
      block-size: 10px;
      border-radius: 50%;
      border: 1.5px solid #fff;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.55), 0 1px 3px rgb(0 0 0 / 0.5);
      pointer-events: none;
    }

    .picker-hue {
      inline-size: 100%;
      block-size: 10px;
      margin: 0;
      border: 1px solid rgb(255 255 255 / 0.05);
      border-radius: 999px;
      appearance: none;
      background: linear-gradient(to right, #ff3b3b, #ffd23b, #3bff6b, #3bdfff, var(--color-accent), #a23bff, #ff3bd1, #ff3b3b);
      accent-color: #fff;
      cursor: ew-resize;
    }

    .picker-hue::-webkit-slider-thumb {
      appearance: none;
      inline-size: 8px;
      block-size: 14px;
      border: 1px solid rgb(0 0 0 / 0.5);
      border-radius: 2px;
      background: #fff;
      box-shadow: 0 0 0 1px rgb(255 255 255 / 0.3);
    }

    .picker-hue::-moz-range-thumb {
      inline-size: 8px;
      block-size: 14px;
      border: 1px solid rgb(0 0 0 / 0.5);
      border-radius: 2px;
      background: #fff;
      box-shadow: 0 0 0 1px rgb(255 255 255 / 0.3);
    }

    .editor-actions,
    .editor-controls,
    .footer,
    .footer-actions,
    .search-field {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .editor-actions {
      align-items: stretch;
      justify-content: space-between;
      gap: 8px;
      margin-top: 2px;
    }

    .editor-controls {
      flex: 1;
      min-width: 0;
    }

    .editor-input-shell,
    .search-field {
      display: flex;
      align-items: center;
      gap: 7px;
      inline-size: 100%;
      min-width: 0;
      block-size: 28px;
      padding: 0 9px;
      background: linear-gradient(180deg, rgb(8 11 14 / 0.98), rgb(5 7 10 / 0.98));
      border: 1px solid rgb(98 113 122 / 0.20);
      border-radius: 6px;
    }

    .editor-input-prefix,
    .editor-input-suffix,
    .search-meta {
      color: var(--color-text-soft);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      flex: none;
    }

    .editor-text-input,
    .search input {
      inline-size: 100%;
      min-width: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--color-text);
      font-size: 11.5px;
      padding: 0;
    }

    .editor-text-input[disabled] {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .editor-text-input::placeholder,
    .search input::placeholder,
    .status-text,
    .empty-copy {
      color: rgb(226 236 232 / 0.42);
    }

    .ghost-button,
    .primary-button,
    .close-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      border: 1px solid rgb(226 236 232 / 0.07);
      border-radius: 5px;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      transition:
        background var(--motion-fast) ease,
        border-color var(--motion-fast) ease,
        color var(--motion-fast) ease,
        transform var(--motion-fast) var(--ease-out),
        box-shadow var(--motion-fast) ease;
    }

    .ghost-button:hover,
    .close-button:hover,
    .action-menu .ghost-button:hover {
      background: rgb(226 236 232 / 0.045);
      border-color: rgb(226 236 232 / 0.12);
      transform: translateY(-1px);
    }

    .ghost-button:active,
    .close-button:active {
      transform: scale(0.97);
      transition-duration: 80ms;
    }

    .ghost-button:disabled,
    .primary-button:disabled,
    .close-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }

    .ghost-button {
      block-size: 24px;
      padding: 0 8px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1px;
      white-space: nowrap;
    }

    .primary-button {
      block-size: 28px;
      padding: 0 10px;
      background: var(--color-accent);
      border-color: rgb(137 191 165 / 0.42);
      color: #05070a;
      font-size: 11.5px;
      font-weight: 600;
      box-shadow:
        0 10px 20px -10px rgb(137 191 165 / 0.55),
        inset 0 1px 0 rgb(255 255 255 / 0.18);
      white-space: nowrap;
    }

    .primary-button:hover {
      background: var(--color-warm);
      border-color: rgb(189 163 137 / 0.50);
      color: #05070a;
      box-shadow:
        0 14px 24px -12px rgb(189 163 137 / 0.55),
        inset 0 1px 0 rgb(255 255 255 / 0.20);
      transform: translateY(-1px);
    }

    .primary-button:active {
      transform: scale(0.97);
      transition-duration: 80ms;
    }

    .close-button {
      inline-size: 22px;
      block-size: 22px;
      padding: 0;
      border-color: transparent;
      color: var(--color-text-soft);
      flex: none;
    }

    .search {
      padding: 8px 10px;
      border-bottom: 1px solid rgb(98 113 122 / 0.15);
      background: linear-gradient(180deg, rgb(7 10 13 / 0.98), rgb(5 7 10 / 0.98));
    }

    .search-icon {
      color: rgb(226 236 232 / 0.42);
    }

    .search-meta[hidden] {
      display: none;
    }

    .list {
      min-height: 180px;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      background: linear-gradient(180deg, rgb(7 10 13 / 0.98), rgb(5 7 10 / 0.98));
    }

    .row-button {
      display: flex;
      align-items: center;
      gap: 9px;
      inline-size: 100%;
      min-width: 0;
      block-size: 28px;
      padding: 0 10px;
      border: 0;
      border-left: 2px solid transparent;
      border-radius: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      text-align: left;
      transition: background var(--motion-fast) ease;
    }

    .row-button:hover {
      background: rgb(137 191 165 / 0.05);
    }

    .row-button.is-selected {
      border-left-color: var(--color-accent);
      background: rgb(137 191 165 / 0.10);
      box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.02), inset 0 -1px 0 rgb(255 255 255 / 0.02);
    }

    .row-button.is-selected .row-name {
      color: var(--color-text);
    }

    .row-swatch {
      --swatch-fill: var(--color-surface);
      inline-size: 12px;
      block-size: 12px;
      border-radius: 4px;
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
      flex: none;
    }

    .row-name {
      flex: 1;
      min-width: 0;
      font-size: 11px;
      font-weight: 400;
      color: rgb(226 236 232 / 0.66);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-state {
      display: grid;
      place-items: center;
      min-height: 120px;
      padding: 18px;
      text-align: center;
    }

    .empty-copy,
    .status-text {
      margin: 0;
      font-size: 11px;
      line-height: 1.35;
    }

    .footer {
      justify-content: space-between;
      gap: 8px;
      padding: 8px 10px;
      border-top: 1px solid rgb(98 113 122 / 0.16);
      background:
        linear-gradient(180deg, rgb(12 18 22 / 0.98), rgb(10 15 19 / 0.98)),
        radial-gradient(circle at 80% 100%, rgb(189 163 137 / 0.06), transparent 28%);
      position: relative;
    }

    .status-text {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .footer-actions {
      margin-left: auto;
      position: relative;
      flex: none;
    }

    .menu-button {
      inline-size: 28px;
      block-size: 28px;
      padding: 0;
      color: rgb(226 236 232 / 0.60);
    }

    .action-menu {
      position: absolute;
      right: 46px;
      bottom: 44px;
      inline-size: 200px;
      display: grid;
      gap: 2px;
      padding: 4px;
      border: 1px solid rgb(98 113 122 / 0.24);
      border-radius: 8px;
      background:
        linear-gradient(180deg, rgb(14 20 24 / 0.98), rgb(10 15 19 / 0.98)),
        radial-gradient(circle at top left, rgb(189 163 137 / 0.08), transparent 30%);
      box-shadow: 0 10px 30px -8px rgb(0 0 0 / 0.75), 0 4px 10px rgb(0 0 0 / 0.45);
      z-index: 10;
    }

    .action-menu[hidden],
    .feedback-toast[hidden] {
      display: none;
    }

    .action-menu .ghost-button {
      justify-content: flex-start;
      inline-size: 100%;
      min-height: 26px;
      padding: 0 8px;
      border: 0;
      border-radius: 4px;
      font-size: 11.5px;
      color: var(--color-text-muted);
    }

    .feedback-toast {
      position: absolute;
      right: 10px;
      bottom: 52px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid rgb(199 236 224 / 0.28);
      border-radius: 6px;
      background: linear-gradient(180deg, rgb(199 236 224 / 0.10), rgb(137 191 165 / 0.08));
      color: var(--color-highlight);
      font-size: 11px;
      box-shadow: 0 6px 18px -4px rgb(0 0 0 / 0.65);
      white-space: nowrap;
    }

    .feedback-toast svg {
      fill: none;
      stroke: currentColor;
    }

    @media (prefers-reduced-motion: reduce) {
      .toggle-button,
      .toggle-button::after,
      .panel,
      .ghost-button,
      .primary-button,
      .close-button,
      .row-button,
      .search-field,
      .editor-input-shell {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
      }
    }

    @media (max-width: 640px) {
      .panel {
        right: 8px;
        top: 8px;
        width: min(352px, calc(100vw - 16px));
        height: min(620px, calc(100vh - 16px));
      }

      .toggle-button {
        right: 12px;
        bottom: 12px;
      }

      .footer {
        align-items: flex-start;
      }

      .status-text {
        max-width: 120px;
      }
    }
  `
}
