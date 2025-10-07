class EvalPortal{
  constructor(application){
    this.application = application;
    this.modules = [];
  }

  async render(){
    // header and nav
    // minimal styles for portal nav
    const style = document.createElement('style');
    style.innerHTML = `
      .eval-header { padding:12px; background:#2c3e50; color:#fff; display:flex; gap:8px; align-items:center; }
      .eval-nav button { margin-right:6px; background:#34495e; color:#fff; border:none; padding:8px 12px; border-radius:4px; cursor:pointer }
      .eval-nav button.active { background:#1abc9c; color:#092; }
      .eval-content { padding:18px; }
    `;
    document.head.appendChild(style);

    const header = document.createElement('div');
    header.className = 'eval-header';
    header.innerHTML = '<h2 style="margin:0 12px 0 0">ModEd - Eval</h2><div id="eval-nav" class="eval-nav"></div>';
    this.application.mainContainer.appendChild(header);

    this.content = document.createElement('div');
    this.content.className = 'eval-content';
    this.application.mainContainer.appendChild(this.content);

    // initialize modules
    this.register('Assignments', new AssignmentApp(this.application));
    this.register('Submissions', new SubmissionApp(this.application));
    this.register('Progress', new ProgressApp(this.application));
    this.register('Quizzes', new QuizApp(this.application));
    this.register('Quiz Submissions', new QuizSubmissionApp(this.application));
    this.register('Evaluations', new EvaluationApp(this.application));

    // create nav buttons
    const nav = header.querySelector('#eval-nav');
    this.modules.forEach((mod, idx) => {
      const btn = document.createElement('button');
      btn.textContent = mod.label;
      btn.onclick = async () => {
        // active state
        nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // render into single content area
        this.content.innerHTML = '';
        await mod.instance.render(this.content);
      };
      nav.appendChild(btn);
      // set first as active by default
      if (idx === 0) btn.classList.add('active');
    });

    // Add a dedicated Manage Submissions button that uses SubmissionManage.js
    const manageBtn = document.createElement('button');
    manageBtn.textContent = 'Manage Submissions';
    manageBtn.onclick = async () => {
      // active state
      nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      manageBtn.classList.add('active');
      this.content.innerHTML = '';
      try{
        if(typeof SubmissionManage === 'undefined'){
          await new Promise((resolve,reject)=>{
            const s = document.createElement('script');
            s.src = RootURL + 'eval/static/js/SubmissionManage.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        const mgr = new SubmissionManage(this.application);
        await mgr.initialize(this.content);
      }catch(err){
        console.error('Failed to load SubmissionManage:', err);
        this.content.innerHTML = '<div style="color:red">Error loading Manage Submissions. See console for details.</div>';
      }
    };
    nav.appendChild(manageBtn);

    // open first module by default
    if (this.modules.length > 0) await this.modules[0].instance.render(this.content);
    return true;
  }

  register(label, instance){
    this.modules.push({label, instance});
  }
}
