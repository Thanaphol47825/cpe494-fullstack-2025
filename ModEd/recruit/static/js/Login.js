if (typeof window !== 'undefined' && !window.RecruitLogin) {
  class RecruitLogin {
    constructor(rootURL) {
      this.rootURL = rootURL || window.RootURL || '';
      this.engine = null;
      this.form = null;
      this.ui = null;
    }

    async init() {
      this.engine = new TemplateEngine();
      
      const isAuthenticated = await this.checkAuthentication();
      if (isAuthenticated) {
        return;
      }

      if (!window.RecruitFormTemplate) {
        await fetch(`${this.rootURL}/recruit/static/js/template/RecruitFormTemplate.js`)
          .then(res => res.text())
          .then(code => eval(code));
      }

      await this.renderLoginForm();
    }

    async checkAuthentication() {
      try {
        const authCheck = await fetch(`${this.rootURL}/recruit/auth/me`, {
          method: 'GET',
          credentials: 'include'
        });
        const authResult = await authCheck.json();
        
        if (authResult.isSuccess && authResult.result) {
          window.location.href = `${this.rootURL}/#recruit`;
          return true;
        }
      } catch (error) {
        console.log('User not authenticated, showing login form');
      }
      return false;
    }

    async renderLoginForm() {
      const formEl = await RecruitFormTemplate.getForm({
        title: 'Recruit Module Login',
        subtitle: 'Sign in to access the recruitment system',
        formId: 'login-form',
        backLink: '/',
        backText: 'Back to Home',
        colorPrimary: '#9333ea',
        colorAccent: '#7e22ce',
        iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      }, 'create');

      const container = document.querySelector('#MainContainer') || document.body;
      container.innerHTML = '';
      container.appendChild(formEl);

      // Setup back button to navigate to home
      const backLink = formEl.querySelector('.back-link');
      if (backLink) {
        backLink.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = `${this.rootURL}/`;
        });
      }

      this.ui = RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'loginMessages',
        resultId: 'loginResult',
      });

      const loginSchema = [
        { type: "text", name: "username", label: "Username", required: true },
        { 
          type: "password", 
          name: "password", 
          label: "Password", 
          required: true,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
          patternMessage: "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"
        }
      ];

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: null,
        schema: loginSchema,
        targetSelector: '#login-form',
        submitHandler: (formData) => this.handleSubmit(formData),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
    }

    async handleSubmit(formData) {
      this.ui.showMessage('Logging in...', 'info');
      
      try {
        const response = await fetch(`${this.rootURL}/common/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.isSuccess) {
          this.ui.showMessage('Login successful! Loading user info...', 'success');
          
          try {
            const userResponse = await fetch(`${this.rootURL}/recruit/auth/me`, {
              method: 'GET',
              credentials: 'include'
            });
            const userResult = await userResponse.json();
            
            if (userResult.isSuccess && userResult.result) {
              const user = userResult.result;
              
              if (user.roles && user.roles.length > 0) {
                localStorage.setItem('role', user.roles[0]);
              }
              
              this.ui.showMessage(`Login successful! Welcome ${user.username || 'User'}. Redirecting...`, 'success');
              
              setTimeout(() => {
                window.location.href = `${this.rootURL}/#recruit`;
              }, 1500);
              return true;
            }
          } catch (err) {
            console.error('Error fetching user info:', err);
          }
          
          setTimeout(() => {
            window.location.href = `${this.rootURL}/#recruit`;
          }, 1500);
          return true;
        } else {
          this.ui.showMessage(result.message || 'Login failed. Please check your credentials.', 'error');
          return false;
        }
      } catch (error) {
        this.ui.showMessage(`Error: ${error.message}`, 'error');
        return false;
      }
    }

  }

  window.RecruitLogin = RecruitLogin;

  document.addEventListener("DOMContentLoaded", async () => {
    const rootURL = window.RootURL || '';
    const login = new RecruitLogin(rootURL);
    await login.init();
  });
}

