<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --primary: #4f46e5;   /* indigo */
      --primary-600:#4338ca;
      --ring:#c7d2fe;
      --success:#16a34a;
      --danger:#e11d48;
      --border:#e5e7eb;
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0; background:
        radial-gradient(1200px 600px at 10% -10%, #eef2ff 0%, transparent 50%),
        radial-gradient(1000px 500px at 110% 10%, #e0e7ff 0%, transparent 45%),
        var(--bg);
      font: 16px/1.6 ui-sans-serif, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans Thai", "Noto Sans", sans-serif;
      color: var(--text);
      display:flex; align-items:center; justify-content:center; padding:32px;
    }
    .card{
      width: 100%; max-width: 720px; background:var(--card); border:1px solid var(--border);
      border-radius: 18px; box-shadow: 0 10px 30px rgba(36,42,69,.06);
      overflow: hidden;
    }
    .header{
      padding: 20px 24px; border-bottom:1px solid var(--border);
      display:flex; align-items:center; gap:12px;
      background: linear-gradient(180deg, #fafafa, #fff);
    }
    .logo{
      display:grid; place-items:center; width:40px; height:40px; border-radius:12px;
      background: linear-gradient(135deg, var(--primary), var(--primary-600));
      color:#fff; font-weight:700;
      box-shadow: 0 6px 16px rgba(79,70,229,.35);
      letter-spacing:.5px;
    }
    h1{font-size: clamp(18px, 2.2vw, 22px); margin:0}
    .sub{color:var(--muted); font-size:14px; margin-top:2px}

    .content{padding: 24px; display:grid; gap: 18px}

    .alert{
      border-radius: 12px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start;
      border:1px solid; font-size:14px; animation: slideFade 0.6s ease-out;
    }
    .alert.success{ background: #ecfdf5; border-color:#bbf7d0; color:#065f46;}
    .alert.error{   background: #fef2f2; border-color:#fecaca; color:#7f1d1d;}
    .alert svg{flex:0 0 18px; margin-top:2px}

    @keyframes slideFade {
      from{ opacity:0; transform: translateY(6px); }
      to{   opacity:1; transform: translateY(0); }
    }

    form{display:grid; gap:14px}
    .field{display:grid; gap:8px}
    label{font-weight:600; font-size:14px}
    input[type="number"], input[type="text"], select{
      width: 100%; padding: 12px 14px; border:1px solid var(--border); border-radius: 12px;
      outline: none; background:#fff; font-size:16px;
      transition: box-shadow .2s, border-color .2s, transform .04s;
    }
    input[type="number"]:focus, input[type="text"]:focus, select:focus{
      border-color: var(--primary);
      box-shadow: 0 0 0 6px var(--ring);
    }
    .hint{font-size:12px; color:var(--muted); margin-top:-4px}

    .actions{display:flex; gap:10px; justify-content:flex-end; margin-top:6px}
    .btn{
      appearance:none; border:1px solid transparent; border-radius: 12px; padding:10px 16px;
      cursor:pointer; font-weight:700; letter-spacing:.2px; transition: transform .05s, box-shadow .2s, background .2s, border-color .2s;
    }
    .btn:active{ transform: translateY(1px) }
    .btn.primary{
      background: linear-gradient(135deg, var(--primary), var(--primary-600));
      color:#fff; box-shadow: 0 6px 18px rgba(79,70,229,.35);
    }
    .btn.secondary{
      background:#fff; border-color:var(--border); color:var(--text);
    }
    .footer{
      padding: 16px 24px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; color:var(--muted); font-size:13px;
      background:#fff;
    }
    a.link{ color:var(--primary); text-decoration:none; font-weight:600 }
    a.link:hover{ text-decoration:underline }
  </style>
</head>
<body>
  <main class="card" role="main" aria-labelledby="title">
    <header class="header">
      <div class="logo">AR</div>
      <div>
        <h1 id="title">{{title}}</h1>
        <div class="sub">สร้างรายงานการสมัครเข้าศึกษา</div>
      </div>
    </header>

    <section class="content">
      <form method="POST" action="{{RootURL}}/recruit/CreateApplicationReport" novalidate>
        <div class="field">
          <label for="ApplicantID">Applicant ID</label>
          <input type="number" id="ApplicantID" name="ApplicantID" placeholder="เช่น 1" required />
          <div class="hint">กรอก ID ของผู้สมัคร</div>
        </div>

        <div class="field">
          <label for="ApplicationRoundsID">Application Round ID</label>
          <input type="number" id="ApplicationRoundsID" name="ApplicationRoundsID" placeholder="เช่น 1" required />
          <div class="hint">กรอก ID ของรอบการสมัคร</div>
        </div>

        <div class="field">
          <label for="FacultyID">Faculty ID</label>
          <input type="number" id="FacultyID" name="FacultyID" placeholder="เช่น 1" />
          <div class="hint">กรอก ID ของคณะ (ไม่บังคับ)</div>
        </div>

        <div class="field">
          <label for="DepartmentID">Department ID</label>
          <input type="number" id="DepartmentID" name="DepartmentID" placeholder="เช่น 1" />
          <div class="hint">กรอก ID ของภาควิชา (ไม่บังคับ)</div>
        </div>

        <div class="field">
          <label for="Program">Program Type</label>
          <input type="text" id="Program" name="Program" placeholder="เช่น Regular, International" />
          <div class="hint">กรอกประเภทโปรแกรม</div>
        </div>

        <div class="field">
          <label for="ApplicationStatuses">Application Status</label>
          <select id="ApplicationStatuses" name="ApplicationStatuses">
            <option value="Pending">Pending</option>
            <option value="Eligible">Eligible</option>
            <option value="Not Eligible">Not Eligible</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div class="hint">เลือกสถานะการสมัคร</div>
        </div>

        <div class="actions">
          <button type="reset" class="btn secondary">ล้างค่า</button>
          <button type="submit" class="btn primary">บันทึก</button>
        </div>
      </form>
    </section>

    <footer class="footer">
      <span>Application Report • ModEd</span>
      <a class="link" href="{{RootURL}}/recruit/GetApplicationReports" target="_blank" rel="noopener">ดูรายการ (JSON)</a>
    </footer>
  </main>
</body>
</html>