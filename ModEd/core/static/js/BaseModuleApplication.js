// Base class that modules can extend for sub-routing functionality
class BaseModuleApplication {
    constructor(templateEngine) {
        this.templateEngine = templateEngine
        this.routes = new Map()
        this.defaultRoute = ''
        this.loadedSubModules = new Set() // Track loaded sub JS files
        this.subModulePath = '' // Base path for sub JS files
    }

    // Set the base path for sub JavaScript files 
    setSubModuleBasePath(path) {
        this.subModulePath = path
    }

    // Load a sub JavaScript file
    async loadSubModule(filename) {
        const fullPath = `${this.subModulePath}/${filename}`
        
        // Check if already loaded
        if (this.loadedSubModules.has(fullPath)) {
            console.log(`Sub-module already loaded: ${fullPath}`)
            return true
        }

        try {
            await this.templateEngine.fetchModule(fullPath)
            this.loadedSubModules.add(fullPath)
            console.log(`Successfully loaded sub-module: ${fullPath}`)
            return true
        } catch (error) {
            console.error(`Failed to load sub-module ${fullPath}:`, error)
            return false
        }
    }

    // Load multiple sub JavaScript files
    async loadSubModules(filenames) {
        const loadPromises = filenames.map(filename => this.loadSubModule(filename))
        const results = await Promise.allSettled(loadPromises)
        
        const successful = results.filter(result => result.status === 'fulfilled' && result.value === true).length
        console.log(`Loaded ${successful}/${filenames.length} sub-modules`)
        
        return results
    }

    // Register a sub-route with optional sub-module loading
    addRouteWithSubModule(path, handler, subModuleFile = null) {
        // Create a wrapper handler that loads the sub-module first
        const wrapperHandler = async (params) => {
            if (subModuleFile) {
                const loaded = await this.loadSubModule(subModuleFile)
                if (!loaded) {
                    console.error(`Failed to load required sub-module: ${subModuleFile}`)
                    return
                }
            }
            await handler(params)
        }
        
        this.addRoute(path, wrapperHandler)
    }

    // Check if a sub-module is loaded
    isSubModuleLoaded(filename) {
        const fullPath = `${this.subModulePath}/${filename}`
        return this.loadedSubModules.has(fullPath)
    }

    // Get list of loaded sub-modules
    getLoadedSubModules() {
        return Array.from(this.loadedSubModules)
    }

    // Register a sub-route
    addRoute(path, handler) {
        this.routes.set(path, handler)
    }

    // Set the default route (when no sub-path is provided)
    setDefaultRoute(path) {
        this.defaultRoute = path
    }

    // Handle routing for this module
    async handleRoute(fullPath) {
        const moduleBasePath = this.getModuleBasePath()
        const subPath = this.templateEngine.getSubPath(moduleBasePath, fullPath)

        console.log(`Module routing - Full: ${fullPath}, Base: ${moduleBasePath}, Sub: ${subPath}`)

        // Try to find exact match first
        if (this.routes.has(subPath)) {
            const handler = this.routes.get(subPath)
            await handler()
            return true
        }

        // Try pattern matching for dynamic routes
        for (const [pattern, handler] of this.routes.entries()) {
            if (this.matchRoute(pattern, subPath)) {
                await handler(this.extractParams(pattern, subPath))
                return true
            }
        }
        console.log("No matching sub-route found.")

        // If no sub-route found and we have a default, use it
        if (this.routes.has(this.defaultRoute)) {
            console.log("Using default route:", this.defaultRoute)
            // Reset to default route
            location.hash = `#${moduleBasePath}/${this.defaultRoute}`
            const handler = this.routes.get(this.defaultRoute)
            await handler()
            return true
        }

        // No route found, let module render normally
        return false
    }

    // Extract module base path from modules.json
    getModuleBasePath() {
        const currentModule = this.templateEngine.getCurrentModule()
        return currentModule ? currentModule.baseRoute : ''
    }

    // Simple route pattern matching (supports :param syntax)
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean)
        const pathParts = path.split('/').filter(Boolean)

        if (patternParts.length !== pathParts.length) return false

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i]
            const pathPart = pathParts[i]

            if (patternPart.startsWith(':')) {
                // Parameter - matches anything
                continue
            } else if (patternPart !== pathPart) {
                return false
            }
        }

        return true
    }

    // Extract parameters from route
    extractParams(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean)
        const pathParts = path.split('/').filter(Boolean)
        const params = {}

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i]
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1)
                params[paramName] = pathParts[i]
            }
        }

        return params
    }

    // Default render method - should be overridden
    async render() {
        console.log('Base render called - should be overridden')
    }
}

// Make classes available globally
if (typeof window !== 'undefined') {
    window.BaseModuleApplication = BaseModuleApplication
}