<section id="recruit-applicant-page" style="--primary: {{colorPrimary}}; --accent: {{colorAccent}};">
  <div class="wrap">
    <header class="header">
      <div class="icon-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{iconPath}}"></path>
        </svg>
      </div>
      <div>
        <h1>{{title}}</h1>
        <p class="subtitle">{{subtitle}}</p>
      </div>
      <a href="#{{backLink}}" routerLink="{{backLink}}" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{backText}}
      </a>
    </header>

    <div id="recruit-form-messages-slot"></div>

    <div class="form-card">
      <form id="{{formId}}">

      </form>
      <div id="recruit-form-result-slot"></div>
    </div>

    <div class="footer-accent"></div>
  </div>


  <style>
    #recruit-applicant-page {
      background: #f9fafb;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      color: #0f172a;
      padding: 2rem;
    }

    .wrap {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .icon-box {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background-color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(2, 8, 20, 0.1);
    }

    .icon-box svg {
      width: 30px;
      height: 30px;
      color: #fff;
    }

    h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary);
      margin: 0;
    }

    .subtitle {
      color: #475569;
      margin-top: 0.25rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 12px;
      background: white;
      border: 1px solid rgba(15, 23, 42, 0.12);
      text-decoration: none;
      color: #334155;
      transition: background 0.2s, transform 0.2s;
    }

    .back-link:hover {
      background: #f1f5f9;
      transform: translateY(-1px);
    }

    .form-card {
      background: white;
      border: 1px solid rgba(2, 8, 20, 0.06);
      border-radius: 16px;
      box-shadow: 0 4px 14px rgba(2, 8, 20, 0.05);
      padding: 1.5rem;
    }

    #applicantMessages .msg {
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 0.9rem;
      font-weight: 600;
      margin: 8px 0;
    }

    #applicantMessages .msg.info {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    #applicantMessages .msg.success {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    #applicantMessages .msg.error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    #applicantResult .notice {
      border-radius: 12px;
      padding: 10px 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    #applicantResult .notice.success {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    #applicantResult .notice.error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    #applicantResult pre {
      background: #111827;
      color: #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid rgba(148, 163, 184, 0.25);
      font-size: 12px;
      overflow: auto;
      max-height: 400px;
      white-space: pre-wrap;
    }

    .footer-accent {
      margin-top: 2rem;
      width: 100px;
      height: 4px;
      border-radius: 2px;
      background-color: var(--accent);
    }
  </style>
</section>
