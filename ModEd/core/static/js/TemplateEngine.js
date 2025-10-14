class TemplateEngine {
  constructor() {
    this.currentModule = null
    this.moduleInstances = new Map()
    this.subRoutes = new Map() // Store sub-routes for each module
    this.routerLinks = new RouterLinks()
    this.initializeRouting()
  }

  initializeRouting() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      console.log('Hash changed:', window.location.hash)
      this.handleRouteChange()
    })

    // Handle initial load
    window.addEventListener('DOMContentLoaded', () => {
      this.handleRouteChange()
    })
  }

  getCurrentPath() {
    // Get path from hash (e.g., #common -> /common)
    return this.routerLinks.getCurrentRoute()
  }

  findModuleByPath(path) {
    if (!path) return null

    // Split path for comparison
    const pathParts = path.split('/').filter(Boolean)

    // Find module where the first segment matches the module's baseRoute (without trailing slash)
    for (const module of modules) {
      const moduleParts = module.baseRoute.split('/').filter(Boolean)
      if (
        pathParts.length >= moduleParts.length &&
        pathParts.slice(0, moduleParts.length).join('/') === moduleParts.join('/')
      ) {
        return module
      }
    }
    return null
  }

  async handleRouteChange() {
    const currentPath = this.getCurrentPath()
    const targetModule = this.findModuleByPath(currentPath)

    if (targetModule) {
      if (targetModule !== this.currentModule) {
        await this.loadModule(targetModule)
      } else {
        // Same module, but check for sub-route changes
        await this.handleSubRoute(targetModule, currentPath)
      }
    } else if (currentPath == null || currentPath == '' || currentPath === '/') {
      // If its the main page or no valid route, show module selection menu
      this.currentModule = null // Reset current module
      this.renderModuleMenu()
    } else {
      // If route is invalid and a module is already loaded, show 404
      this.currentModule = null // Reset current module
      this.render404Page(currentPath)
    }
  }

  async handleSubRoute(moduleConfig, fullPath) {
    const moduleInstance = this.moduleInstances.get(moduleConfig.className)

    if (moduleInstance && typeof moduleInstance.handleRoute === 'function') {
      // Let the module handle its own sub-routing
      const handled = await moduleInstance.handleRoute(fullPath)
      if (!handled) {
        // If module couldn't handle the route, render the module normally
        await moduleInstance.render()
      }
    } else if (moduleInstance && typeof moduleInstance.render === 'function') {
      // Fallback to normal rendering
      await moduleInstance.render()
    }
  }

  async loadModule(moduleConfig) {
    try {
      // Fetch the module script if not already loaded
      if (!this.moduleInstances.has(moduleConfig.className)) {
        await this.fetchModule(moduleConfig.script)
        const moduleInstance = eval(`new ${moduleConfig.className}(this)`)
        this.moduleInstances.set(moduleConfig.className, moduleInstance)
      }

      // Set current module and render
      this.currentModule = moduleConfig
      const moduleInstance = this.moduleInstances.get(moduleConfig.className)

      if (moduleInstance && typeof moduleInstance.render === 'function') {
        await moduleInstance.render()
      }
    } catch (error) {
      console.error(`Error loading module ${moduleConfig.label}:`, error)
      // Reset currentModule on error to maintain consistency
      this.currentModule = null
      this.renderModuleMenu() // Fallback to menu
    }
  }

  async fetchModule(path) {
    // Handle multiple scripts separated by comma
    const scripts = path.split(',').map(s => s.trim())
    
    for (const scriptPath of scripts) {
      let URL = RootURL + scriptPath
      let script = document.createElement('script')
      script.src = URL
      document.head.appendChild(script)
      
      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
      })
    }
  }

  async fetchTemplate() {
    let URL = RootURL + '/template'
    let response = await fetch(URL)
    this.template = await response.json()
  }

  async render() {
    await this.fetchTemplate()
    this.mainContainer = document.getElementById('MainContainer')

    // Check if we have a current route first
    const currentPath = this.getCurrentPath()
    const targetModule = this.findModuleByPath(currentPath)

    if (targetModule) {
      await this.loadModule(targetModule)
    } else {
      this.renderModuleMenu()
    }
  }

  renderModuleMenu() {
    this.mainContainer = document.getElementById('MainContainer')
    this.mainContainer.innerHTML = ''

    // Ensure currentModule is cleared when showing menu
    this.currentModule = null

    // Create menu container
    const menuContainer = this.create(`<div class="menu-container"></div>`)

    // Create navigation menu
    const menuTitle = this.create(`<h2 class="menu-title">Select a Module:</h2>`)
    this.mainContainer.appendChild(menuTitle)

    // Create module buttons
    const moduleList = this.create(`<div class="module-list"></div>`)

    for (const module of modules) {
      let button = this.routerLinks.createRouterLink(module.label, module.baseRoute.slice(1), '')
      button.classList.add('module-button')
      moduleList.appendChild(button)
    }
    
    menuContainer.appendChild(moduleList)
    this.mainContainer.appendChild(moduleList)
  }

  create(code) {
    let element = document.createElement('div')
    element.innerHTML = code
    return element.firstElementChild || element
  }

  // Helper method to navigate programmatically
  navigateTo(moduleRoute) {
    this.routerLinks.navigateTo(moduleRoute)
  }

  // Get current module info
  getCurrentModule() {
    return this.currentModule
  }

  // Get all available modules
  getAvailableModules() {
    return modules
  }

  // Register sub-routes for a module
  registerSubRoutes(moduleName, routes) {
    this.subRoutes.set(moduleName, routes)
  }

  // Get sub-routes for a module
  getSubRoutes(moduleName) {
    return this.subRoutes.get(moduleName) || []
  }

  // Extract sub-path from full path for a module
  getSubPath(moduleBasePath, fullPath) {
    if (!fullPath || !moduleBasePath) return ''

    const moduleParts = moduleBasePath.split('/').filter(Boolean)
    const fullParts = fullPath.split('/').filter(Boolean)

    if (fullParts.length > moduleParts.length) {
      return '/' + fullParts.slice(moduleParts.length).join('/')
    }

    return ''
  }

  async checkUserPermission(requiredPermission) {
    // @SK-Tonhom This function will use for checking user permission before entering route.
    console.log('Checking permission for:', requiredPermission)
    return false;
  }

  // Create a route helper for modules
  createSubRoute(moduleName, subPath, handler) {
    const routes = this.getSubRoutes(moduleName)
    routes.push({ path: subPath, handler })
    this.registerSubRoutes(moduleName, routes)
  }

  // Debug method to verify currentModule state
  debugCurrentState() {
    const currentPath = this.getCurrentPath()
    const expectedModule = this.findModuleByPath(currentPath)

    console.log('=== Template Engine Debug ===')
    console.log('Current URL Hash:', window.location.hash)
    console.log('Current Path:', currentPath)
    console.log('Expected Module:', expectedModule?.label || 'None')
    console.log('Actual currentModule:', this.currentModule?.label || 'None')
    console.log('States Match:', expectedModule === this.currentModule)
    console.log('Loaded Modules:', Array.from(this.moduleInstances.keys()))
    console.log('============================')

    return {
      currentPath,
      expectedModule,
      actualModule: this.currentModule,
      statesMatch: expectedModule === this.currentModule,
    }
  }

  render404Page(invalidPath) {
    this.mainContainer = document.getElementById('MainContainer')
    this.mainContainer.innerHTML = ''

    // Ensure currentModule is cleared when showing 404
    this.currentModule = null

    const errorMessage = this.create(`
      <div class="error-page">
        <h2>404 - Page Not Found</h2>
        <p>The path "<strong>${invalidPath}</strong>" does not exist.</p>
        <p>Please select a valid module from the list below:</p>
        <a routerLink="" class="btn-home">Go to Main Page</a>
      </div>
    `)
    this.mainContainer.appendChild(errorMessage)
  }
}
