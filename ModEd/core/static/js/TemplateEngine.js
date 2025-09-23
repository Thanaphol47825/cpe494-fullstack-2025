class TemplateEngine {
  constructor() {
    this.currentModule = null
    this.moduleInstances = new Map()
    this.subRoutes = new Map() // Store sub-routes for each module
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
      this.initializeRouterLinks()
    })

    // Listen for dynamic content changes to handle new routerLink elements
    this.observeRouterLinks()
  }

  initializeRouterLinks() {
    // Find all elements with routerLink attribute and set up navigation
    document.querySelectorAll('[routerLink]').forEach(element => {
      this.setupRouterLink(element)
    })
  }

  setupRouterLink(element) {
    const routerLink = element.getAttribute('routerLink')
    if (!routerLink) return

    // Remove any existing click handlers to avoid duplicates
    element.removeEventListener('click', element._routerLinkHandler)

    // Create and store the handler
    element._routerLinkHandler = (e) => {
      e.preventDefault()
      this.navigateTo(routerLink)
    }

    // Add click handler
    element.addEventListener('click', element._routerLinkHandler)

    // Add visual feedback for router links
    element.style.cursor = 'pointer'
    if (!element.classList.contains('router-link')) {
      element.classList.add('router-link')
    }
  }

  observeRouterLinks() {
    // Create a MutationObserver to watch for new routerLink elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node has routerLink
            if (node.hasAttribute && node.hasAttribute('routerLink')) {
              this.setupRouterLink(node)
            }
            // Check for routerLink in child elements
            if (node.querySelectorAll) {
              node.querySelectorAll('[routerLink]').forEach(element => {
                this.setupRouterLink(element)
              })
            }
          }
        })
      })
    })

    // Wait for DOMContentLoaded to ensure document.body exists
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        })
      })
    }

    // Store observer for cleanup if needed
    this.routerLinkObserver = observer
  }

  getCurrentPath() {
    // Get path from hash (e.g., #common -> /common)
    const hash = window.location.hash.slice(1) // Remove #
    console.log('Current hash:', hash)

    // Handle both #common and #/common formats
    if (hash) {
      return hash.startsWith('/') ? hash : `/${hash}`
    }

    return null
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
    } else if (currentPath == null || currentPath == '') {
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
      console.log(this.moduleInstances)
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

      console.log(`Loaded module: ${moduleConfig.label} (${moduleConfig.baseRoute})`)
    } catch (error) {
      console.error(`Error loading module ${moduleConfig.label}:`, error)
      // Reset currentModule on error to maintain consistency
      this.currentModule = null
      this.renderModuleMenu() // Fallback to menu
    }
  }

  async fetchModule(path) {
    let URL = RootURL + path
    let script = document.createElement('script')
    script.src = URL
    document.head.appendChild(script)
    return new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
    })
  }

  async render() {
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

    // Create navigation menu
    const menuTitle = this.create(`<h2>Select a Module:</h2>`)
    this.mainContainer.appendChild(menuTitle)

    const moduleList = this.create(`<div style="display: flex; flex-direction: column; gap: 4px;"></div>`)

    for (const module of modules) {
      let button = this.createRouterLink(module.label, module.baseRoute.slice(1), '')
      moduleList.appendChild(button)
    }

    this.mainContainer.appendChild(moduleList)
    
    // Initialize router links for the newly created elements
    this.initializeRouterLinks()
  }

  create(code) {
    let element = document.createElement('div')
    element.innerHTML = code
    return element.firstElementChild || element
  }

  // Helper method to navigate programmatically
  navigateTo(moduleRoute) {
    // Handle empty route (go to home/menu)
    if (!moduleRoute || moduleRoute === '') {
      window.location.hash = ''
      return
    }
    
    // Clean the route and set hash
    const cleanRoute = moduleRoute.startsWith('/') ? moduleRoute.slice(1) : moduleRoute
    window.location.hash = cleanRoute
  }

  // Create router link programmatically
  createRouterLink(text, route, className = '') {
    const link = document.createElement('a')
    link.setAttribute('routerLink', route)
    link.textContent = text
    if (className) {
      link.className = className
    }
    this.setupRouterLink(link)
    return link
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
    console.log('States Match:', (expectedModule === this.currentModule))
    console.log('Loaded Modules:', Array.from(this.moduleInstances.keys()))
    console.log('============================')
    
    return {
      currentPath,
      expectedModule,
      actualModule: this.currentModule,
      statesMatch: expectedModule === this.currentModule
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
    
    // Initialize router links for the newly created elements
    this.initializeRouterLinks()
  }
}
