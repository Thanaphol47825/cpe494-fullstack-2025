{{ define "content" }}
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{ .Title }}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 560px; margin: 40px auto; }
    form { display: grid; gap: 12px; }
    input, button { padding: 10px; font-size: 16px; }
  </style>
</head>
<body>
  <h1>{{ .Title }}</h1>

  <!-- แบบส่งฟอร์ม native (x-www-form-urlencoded) -->
  <form method="POST" action="/curriculum/CreateInternshipReport">
    <label for="ReportScore">Report Score</label>
    <input id="ReportScore" name="ReportScore" type="number" min="0" max="100" required />
    <button type="submit">Submit</button>
  </form>

  <hr/>

  <!-- แบบส่งด้วย fetch เป็น JSON -->
  <form id="fetchForm">
    <label for="score2">Report Score (via fetch)</label>
    <input id="score2" type="number" min="0" max="100" required />
    <button type="submit">Submit (Fetch JSON)</button>
    <div id="msg" style="margin-top:8px;"></div>
  </form>

  <script>
    const f = document.getElementById('fetchForm');
    const msg = document.getElementById('msg');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const score = parseInt(document.getElementById('score2').value, 10);
      try {
        const res = await fetch('/curriculum/CreateInternshipReport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ReportScore: score })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        msg.textContent = '✅ created id=' + data.result.ID + ' score=' + data.result.ReportScore;
        f.reset();
      } catch (err) {
        msg.textContent = '❌ ' + err.message;
      }
    });
  </script>
</body>
</html>
{{ end }}
