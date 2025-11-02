<section class="form-container recruit-table">
  <header class="recruit-header">
    <div class="recruit-header-left">
      <div class="icon-bg" data-role="icon-bg" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="{{iconPath}}"></path>
        </svg>
      </div>
      <div>
        <h2 class="recruit-title">{{title}}</h2>
        <p class="recruit-subtitle">{{subtitle}}</p>
      </div>
    </div>
    {{#backLink}}
    <a href="#{{backLink}}" routerLink="{{backLink}}" class="btn btn-secondary">
      ← {{backText}}
    </a>
    {{/backLink}}
  </header>

  <div id="recruit-table-messages-slot"></div>

  <div class="recruit-toolbar">
    <button data-action="create" class="btn btn-primary">➕ Add New</button>
    <button data-action="import" class="btn btn-import">📥 Import</button>
  </div>

  <div class="recruit-grid">
    <div class="recruit-table-wrap recruit-table-fullwidth">
      <div id="recruit-table-container"></div>
    </div>
  </div>

  <div id="recruit-table-result-slot" class="result-slot"></div>

  <style>
    .recruit-table {
      --rt-primary: #2563eb;
      --rt-accent:  #1e40af;
      --rt-bg: #ffffff;
      --rt-border: #e5e7eb;
      --rt-border-soft: #eeeeee;
      --rt-text: #111827;
      --rt-subtext: #6b7280;
      --rt-muted: #f3f4f6;
      --rt-import-bg: #eef2ff;
      max-width: 1600px;
    }

    .recruit-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    .recruit-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .icon-bg {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      color: #fff;
      background: var(--rt-primary);
    }
    .recruit-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--rt-text);
      margin: 0;
    }
    .recruit-subtitle {
      font-size: .875rem;
      color: var(--rt-subtext);
      margin: 0;
    }

    .btn {
      padding: 8px 12px;
      border-radius: 10px;
      text-decoration: none;
      border: none;
      cursor: pointer;
      line-height: 1.2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-secondary {
      background: var(--rt-muted);
      color: var(--rt-text);
    }
    .btn-primary {
      background: var(--rt-primary);
      color: white;
    }
    .btn-import {
      background: var(--rt-import-bg);
      color: var(--rt-accent);
    }

    .recruit-toolbar {
      display: flex;
      gap: 10px;
      margin: 10px 0 14px;
    }

    .recruit-grid {
      display: grid;
      grid-template-columns: 2fr 0.9fr;
      gap: 18px;
      height: calc(100vh - 220px);
      overflow: hidden;
    }

    .recruit-table-wrap {
      overflow: auto;
      border: 1px solid var(--rt-border);
    }

    .recruit-table-fullwidth {
      grid-column: 1 / -1;
      border-radius: 12px;
      background: var(--rt-bg);
      min-width: 0;
    }
    #recruit-table-container {
      min-width: 720px;
    }

    .recruit-sidepanel {
      display: flex;
      flex-direction: column;
      overflow: auto;
      background: var(--rt-bg);
      border: 1px solid var(--rt-border-soft);
      border-radius: 12px;
      padding: 16px;
      min-width: 0; 
    }
    .sidepanel-title {
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .sidepanel-body {
      flex: 1;
      overflow: auto;
    }

    .result-slot {
      margin-top: 16px;
    }

    .msg { margin: 8px 0; padding: 10px 12px; border-radius: 10px; }
    .msg.info { background:#dbeafe; color:#1d4ed8; }
    .msg.success { background:#dcfce7; color:#166534; }
    .msg.error { background:#fee2e2; color:#b91c1c; }

    .notice { margin-bottom:8px; padding:8px 10px; border-radius:8px; font-weight:500; }
    .notice.success { background:#ecfdf5; color:#065f46; }
    .notice.error { background:#fef2f2; color:#991b1b; }

    .json-box { margin:0; padding:12px; border-radius:10px; background:#111827; color:#e5e7eb; overflow:auto; }
    .json-box.success { outline: 2px solid #10b98122; }
    .json-box.error { outline: 2px solid #ef444422; }

    @media (max-width: 1024px) {
      .recruit-grid {
        grid-template-columns: 1fr;
        height: auto;
      }
      #recruit-table-container {
        min-width: 0;
      }
    }
  </style>
</section>
