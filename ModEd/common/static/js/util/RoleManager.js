if (typeof window !== 'undefined' && !window.CommonRoleManager) {
  class CommonRoleManager {
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
      localStorage.setItem('role', role); // Also set 'role' for compatibility

      // Show feedback
      this.showRoleFeedback(role);

      // Re-render the menu to update card visibility
      // Check if we're on the common module home page
      if (window.location.hash === '#common' || window.location.hash === '#common/') {
        // Reload the common module home page to reflect new role
        if (window.commonApplication && window.commonApplication.renderMenu) {
          window.commonApplication.renderMenu();
        }
      } else {
        // Just update the display if we're not on home page
        this.updateRoleDisplay();
      }
    }

    getCurrentRole() {
      return localStorage.getItem('userRole') || localStorage.getItem('role') || null;
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
      toast.className = 'fixed top-4 right-4 z-50 transition-all duration-300';
      toast.style.opacity = '0';

      // Use inline styles for colors to ensure they work
      const bgColors = {
        'blue': '#3b82f6',
        'emerald': '#10b981',
        'purple': '#a855f7'
      };

      toast.innerHTML = `
        <div style="background-color: ${bgColors[colorClass]}; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span style="font-weight: 500;">Role set to: ${role}</span>
          </div>
        </div>
      `;

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
      localStorage.removeItem('role');
      this.updateRoleDisplay();
    }
  }

  // Create global instance
  window.CommonRoleManager = CommonRoleManager;
  window.commonRoleManager = new CommonRoleManager();

  // Global function for inline onclick handlers
  window.setCommonRole = function(role) {
    window.commonRoleManager.setRole(role);
  };
}
