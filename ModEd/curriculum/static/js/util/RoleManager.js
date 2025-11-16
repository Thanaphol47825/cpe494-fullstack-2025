if (typeof window !== 'undefined' && !window.RoleManager) {
  class RoleManager {
    constructor() {
      this.roles = ['Student', 'Instructor', 'Admin'];
      this.init();
    }

    init() {
      // Initialize role display when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.updateRoleDisplay());
      } else {
        this.updateRoleDisplay();
      }
    }

    setRole(role) {
      if (!this.roles.includes(role)) {
        console.warn(`Invalid role: ${role}`);
        return;
      }

      // Save role to localStorage
      localStorage.setItem('userRole', role);

      // Update UI
      this.updateRoleDisplay();

      // Show feedback
      this.showRoleFeedback(role);
    }

    getCurrentRole() {
      return localStorage.getItem('userRole') || null;
    }

    updateRoleDisplay() {
      const currentRole = this.getCurrentRole();
      const displayElement = document.getElementById('current-role-display');

      if (displayElement) {
        displayElement.textContent = currentRole ? `(${currentRole})` : '';
      }

      // Update button styles
      const buttons = {
        'Student': document.getElementById('role-student'),
        'Instructor': document.getElementById('role-instructor'),
        'Admin': document.getElementById('role-admin')
      };

      // Reset all buttons
      Object.values(buttons).forEach(btn => {
        if (btn) {
          btn.classList.remove('bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'text-white');
          btn.classList.add('bg-slate-100', 'text-slate-600');
        }
      });

      // Highlight current role
      if (currentRole && buttons[currentRole]) {
        buttons[currentRole].classList.remove('bg-slate-100', 'text-slate-600');
        buttons[currentRole].classList.add('text-white');

        if (currentRole === 'Student') {
          buttons[currentRole].classList.add('bg-blue-500');
        } else if (currentRole === 'Instructor') {
          buttons[currentRole].classList.add('bg-emerald-500');
        } else if (currentRole === 'Admin') {
          buttons[currentRole].classList.add('bg-purple-500');
        }
      }

      // Update create button visibility based on role
      this.updateCreateButtonVisibility();
    }

    updateCreateButtonVisibility() {
      const currentRole = this.getCurrentRole();
      const createButtons = document.querySelectorAll('.create-btn');

      createButtons.forEach(btn => {
        const modelName = btn.getAttribute('data-model');
        
        // Default: show all buttons
        let shouldHide = false;

        if (currentRole === 'Student') {
          // Hide all create buttons for Student
          shouldHide = true;
        } else if (currentRole === 'Instructor') {
          // Hide create buttons for Curriculum, Course, and Class
          const restrictedModels = ['Curriculum', 'Course', 'Class'];
          shouldHide = restrictedModels.includes(modelName);
        } else if (currentRole === 'Admin') {
          // Admin can see all create buttons
          shouldHide = false;
        }

        // Apply visibility
        if (shouldHide) {
          btn.classList.add('hidden');
        } else {
          btn.classList.remove('hidden');
        }
      });
    }

    showRoleFeedback(role) {
      const colors = {
        'Student': 'blue',
        'Instructor': 'emerald',
        'Admin': 'purple'
      };

      const colorClass = colors[role] || 'slate';

      // Create feedback toast
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 bg-${colorClass}-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`;
      toast.style.opacity = '0';

      // Create inner container
      const container = document.createElement('div');
      container.className = 'flex items-center gap-2';

      // Create SVG icon
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'w-5 h-5');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('d', 'M5 13l4 4L19 7');

      svg.appendChild(path);

      // Create text span
      const span = document.createElement('span');
      span.className = 'font-medium';
      span.textContent = `Role set to: ${role}`;

      // Assemble elements
      container.appendChild(svg);
      container.appendChild(span);
      toast.appendChild(container);

      document.body.appendChild(toast);

      // Fade in
      setTimeout(() => {
        toast.style.opacity = '1';
      }, 10);

      // Fade out and remove after 2 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }

    clearRole() {
      localStorage.removeItem('userRole');
      this.updateRoleDisplay();
    }
  }

  // Create global instance
  window.RoleManager = RoleManager;
  window.roleManager = new RoleManager();

  // Global function for inline onclick handlers
  window.setRole = function(role) {
    window.roleManager.setRole(role);
  };
}
