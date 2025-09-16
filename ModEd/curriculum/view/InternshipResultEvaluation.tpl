<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{
      --bg:#f5f7fb; --card:#fff; --text:#0f172a; --muted:#64748b;
      --primary:#4f46e5; --primary-600:#4338ca; --ring:#c7d2fe;
      --success:#16a34a; --danger:#e11d48; --border:#e5e7eb;
    }
    *{box-sizing:border-box}
    body{margin:0;background:radial-gradient(1200px 600px at 10% -10%, #eef2ff 0%, transparent 50%),radial-gradient(1000px 500px at 110% 10%, #e0e7ff 0%, transparent 45%),var(--bg);font:16px/1.6 ui-sans-serif,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial,"Noto Sans Thai",sans-serif;color:var(--text);display:flex;align-items:center;justify-content:center;padding:32px}
    .card{width:100%;max-width:820px;background:var(--card);border:1px solid var(--border);border-radius:18px;box-shadow:0 10px 30px rgba(36,42,69,.06);overflow:hidden}
    .header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;background:linear-gradient(180deg,#fafafa,#fff)}
    .logo{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--primary-600));color:#fff;font-weight:700;box-shadow:0 6px 16px rgba(79,70,229,.35);letter-spacing:.5px}
    h1{font-size:clamp(18px,2.2vw,22px);margin:0}
    .sub{color:var(--muted);font-size:14px;margin-top:2px}
    .content{padding:24px;display:grid;gap:18px}
    .alert{border-radius:12px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;border:1px solid;font-size:14px}
    .alert.success{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
    .alert.error{background:#fef2f2;border-color:#fecaca;color:#7f1d1d}
    form{display:grid;gap:14px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .field{display:grid;gap:8px}
    label{font-weight:600;font-size:14px}
    input,textarea{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:12px;outline:none;background:#fff;font-size:16px;transition:box-shadow .2s,border-color .2s}
    input:focus,textarea:focus{border-color:var(--primary);box-shadow:0 0 0 6px var(--ring)}
    textarea{min-height:110px;resize:vertical}
    .hint{font-size:12px;color:var(--muted);margin-top:-4px}
    .actions{display:flex;gap:10px;justify-content:flex-end;margin-top:6px}
    .btn{appearance:none;border:1px solid transparent;border-radius:12px;padding:10px 16px;cursor:pointer;font-weight:700;letter-spacing:.2px;transition:transform .05s,box-shadow .2s,background .2s,border-color .2s}
    .btn:active{transform:translateY(1px)}
    .btn.primary{background:linear-gradient(135deg,var(--primary),var(--primary-600));color:#fff;box-shadow:0 6px 18px rgba(79,70,229,.35)}
    .btn.secondary{background:#fff;border-color:var(--border);color:var(--text)}
    .footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:13px;background:#fff}
    a.link{color:var(--primary);text-decoration:none;font-weight:600}
    a.link:hover{text-decoration:underline}
  </style>
</head>
<body>
  <main class="card" role="main" aria-labelledby="title">
    <header class="header">
      <div class="logo">RE</div>
      <div>
        <h1 id="title">{{title}}</h1>
        <div class="sub">บันทึกผลประเมินฝึกงาน (Score 0–100)</div>
      </div>
    </header>

    <section class="content">
      {{#success}}<div class="alert success"><strong>บันทึกสำเร็จ!</strong> รายการถูกบันทึกลงฐานข้อมูลแล้ว</div>{{/success}}

      <form method="POST" action="{{RootURL}}/curriculum/CreateInternshipResultEvaluation" novalidate>
        <div class="row">
          <div class="field">
            <label for="InternshipInformationId">InternshipInformationId</label>
            <input type="number" id="InternshipInformationId" name="InternshipInformationId" min="1" placeholder="เช่น 101" required />
            <div class="hint">อ้างอิงกับข้อมูลฝึกงาน (ID) ที่มีอยู่ในระบบ</div>
          </div>

          <div class="field">
            <label for="Score">Score</label>
            <input type="number" id="Score" name="Score" min="0" max="100" placeholder="เช่น 90" required />
            <div class="hint">ช่วงคะแนน 0–100</div>
          </div>
        </div>

        <div class="field">
          <label for="Comment">Comment</label>
          <textarea id="Comment" name="Comment" placeholder="หมายเหตุ/ความเห็นประกอบ (ไม่เกิน 255 ตัวอักษร)"></textarea>
        </div>

        <div class="actions">
          <button type="reset" class="btn secondary">ล้างค่า</button>
          <button type="submit" class="btn primary">บันทึก</button>
        </div>
      </form>
    </section>

    <footer class="footer">
      <span>Result Evaluation • ModEd</span>
      <a class="link" href="{{RootURL}}/curriculum/InternshipResultEvaluation" target="_blank" rel="noopener">ดูรายการ (JSON)</a>
    </footer>
  </main>
</body>
</html>
