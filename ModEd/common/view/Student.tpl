<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>

  <script src="{{ RootURL }}/core/static/js/mustache.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>

  <link rel="stylesheet" href="{{ RootURL }}/core/static/css/Style.css" />
</head>
<body>
  <main class="form-container">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
      <a id="commonBackToMain" href="{{ RootURL }}/common" class="btn-home">← Back to Common Menu</a>
    </div>

    <header style="margin-bottom: 12px;">
      <h2 style="margin:0;">Add Student</h2>
    </header>

    <!-- FORM -->
    <form id="commonStudentForm">
      <div class="form-field">
        <label for="student_code">Student Code *</label>
        <input id="student_code" name="student_code" type="text" required placeholder="STU001" />
      </div>

      <div class="form-field">
        <label for="email">Email *</label>
        <input id="email" name="email" type="email" required placeholder="name@example.com" />
      </div>

      <div class="form-field">
        <label for="first_name">First Name *</label>
        <input id="first_name" name="first_name" type="text" required placeholder="First name" />
      </div>

      <div class="form-field">
        <label for="last_name">Last Name *</label>
        <input id="last_name" name="last_name" type="text" required placeholder="Last name" />
      </div>

      <div class="form-field">
        <label for="department">Department</label>
        <input id="department" name="department" type="text" placeholder="Department" />
      </div>

      <div class="form-field">
        <label for="program">Program</label>
        <input id="program" name="program" type="text" placeholder="Program" />
      </div>

      <div class="form-field">
        <label for="Gender">Gender</label>
        <select id="Gender" name="Gender" class="form-select">
            <option value="" disabled selected>Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
        </select>
      </div>

      <div class="form-field">
        <label for="CitizenID">Citizen ID</label>
        <input id="CitizenID" name="CitizenID" type="text" placeholder="Citizen ID" />
      </div>

      <div class="form-field">
        <label for="PhoneNumber">Phone Number</label>
        <input id="PhoneNumber" name="PhoneNumber" type="tel" placeholder="Phone Number" />
      </div>

      <div class="form-field">
        <label for="AdvisorCode">Advisor Code</label>
        <input id="AdvisorCode" name="AdvisorCode" type="text" placeholder="Advisor Code" />
      </div>

      <div class="form-field">
        <label for="start_date">Start Date</label>
        <input id="start_date" name="start_date" type="date" />
      </div>

      <div class="form-field">
        <label for="birth_date">Birth Date</label>
        <input id="birth_date" name="birth_date" type="date" />
      </div>

      <!-- Actions -->
      <div class="form-field" style="display:flex; gap:12px; align-items:center; margin-top: 8px;">
        <button type="submit" class="form-submit-btn">Create Student</button>
        <button type="reset" class="form-reset-btn">Reset</button>
        <span id="commonStudentStatus" class="status-text"></span>
      </div>
    </form>

    <!-- Result / message area -->
    <div id="commonStudentResult" class="hidden" style="margin-top: 12px;"></div>
  </main>

  <script>window.RootURL = "{{ RootURL }}";</script>
  <script src="{{ RootURL }}/common/static/js/features/StudentForm.js" defer></script>

</body>
</html>