<!DOCTYPE html>
<html lang="en">
<head>
  <title>Intern Skill</title>
  <meta charset="utf-8" />
</head>
<body>
  <h1>Create Intern Skill</h1>

  <!-- ฟอร์มหลัก -->
  <form id="intern-skill-form">
    <label for="skill_name">Skill Name</label>
    <input type="text" id="skill_name" name="skill_name" required><br>
    <input type="hidden" id="editing_id" name="editing_id" />
    <button type="submit" id="submit-btn">Create Skill</button>
  </form>

  <!-- ตารางรายการ -->
  <h2>Intern Skill List</h2>
  <div id="intern-skill-table"></div>

  <!-- ส่ง RootURL ให้ JS ใช้งาน -->
  <script>
    window.__InternSkillConfig = {
      rootURL: "{{RootURL}}"
    };
  </script>

  <!-- โหลดสคริปต์หน้า InternSkill -->
  <!-- ปรับ path ตามที่คุณวางไฟล์จริง -->
  <script src="static/js/InternSkillCreate.js"></script>

  <!-- bootstrap ถ้าคุณมี application กลางอยู่แล้ว ให้ใช้ต่อได้เลย -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // ถ้าคุณมี Application object อยู่แล้ว ให้ใช้ของคุณแทนนี้
      const fallbackApp = {
        mainContainer: document.body,
        template: window.Template || {},    // ใส่ Mustache partials ของคุณ
        create: (html) => { const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }
      };

      const app = window.Application || fallbackApp;
      const page = new window.InternSkillPage(app);
      page.render();
    });
  </script>
</body>
</html>
