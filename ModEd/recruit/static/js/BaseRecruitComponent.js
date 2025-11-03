/**
 * BaseRecruitComponent - Base class for all recruit components
 * Handles common initialization and navigation
 */
if (typeof window !== 'undefined' && !window.BaseRecruitComponent) {
  class BaseRecruitComponent {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine || this.app;
      this.container = this.engine?.mainContainer || 
                      this.app?.mainContainer || 
                      document.querySelector('#app') || 
                      null;
      this.rootURL = rootURL ?? 
                    this.app?.rootURL ?? 
                    window.RootURL ?? 
                    window.__ROOT_URL__ ?? 
                    '';
      this.ui = null;
    }

    _assertContainer() {
      if (!this.container) {
        console.error(`${this.constructor.name}: mainContainer not found`);
        return false;
      }
      return true;
    }

    _assertDeps(deps = []) {
      const missing = deps.filter(dep => {
        const [ns, method] = dep.split('.');
        return method ? typeof window[ns]?.[method] !== 'function' : typeof window[ns] !== 'function';
      });
      
      if (missing.length) {
        console.error('Missing dependencies:', missing.join(', '));
        if (this.container) {
          this.container.innerHTML = `
            <div class="p-4 rounded border border-red-200 bg-red-50 text-red-700">
              Missing dependencies: ${missing.join(', ')}.
            </div>`;
        }
        return false;
      }
      return true;
    }

    _navigateTo(route) {
      if (window.RouterLinks) {
        new window.RouterLinks().navigateTo(route);
      } else {
        window.location.hash = route;
      }
    }

    _setNavigationSource(key, value) {
      sessionStorage.setItem(key, value);
    }

    _getNavigationSource(key) {
      return sessionStorage.getItem(key);
    }

    _clearNavigationSource(key) {
      sessionStorage.removeItem(key);
    }

    _checkIfCameFromTable(sourceKey) {
      return this._getNavigationSource(sourceKey) === 'table';
    }
  }

  window.BaseRecruitComponent = BaseRecruitComponent;
}
