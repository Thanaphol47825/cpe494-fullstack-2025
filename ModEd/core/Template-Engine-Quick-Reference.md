# 📋 ModEd Template Engine By Core Team

## 🚀 Quick Start

### 1. Basic Module Setup
```javascript
class YourModule extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine)
    this.setSubModulePath('/your-module/static/js/components')
    this.setupRoutes()
  }

  setupRoutes() {
    this.addRoute('', this.renderHome.bind(this))
    this.addRoute('/list', this.renderList.bind(this))
    this.addRoute('/item/:id', this.renderDetail.bind(this))
    this.addRouteWithSubModule('/advanced', this.renderAdvanced.bind(this), 'Enhancement.js')
  }

  async render() {
    return await this.handleRoute(this.templateEngine.getCurrentPath())
  }
}
```

### 2. RouterLink Navigation
```html
<!-- Basic links -->
<a routerLink="module">Module Home</a>
<a routerLink="module/feature">Feature Page</a>
<a routerLink="">Main Menu</a>

<!-- Dynamic content -->
<a routerLink="module/item/123">Item 123</a>
<button routerLink="module/create">Add New</button>
```

### 3. Sub-Module Creation
```javascript
// /module/static/js/components/Feature.js
class FeatureManager {
  constructor() {
    console.log('Feature loaded')
  }
  
  enhance(container) {
    // Enhanced functionality
  }
}

if (typeof window !== 'undefined') {
  window.FeatureManager = FeatureManager
}
```

## 📡 API Quick Reference

### TemplateEngine
```javascript
engine.navigateTo('module/path')                // Navigate to route
engine.getCurrentPath()                         // Get current path
engine.getCurrentModule()                       // Get current module
engine.createRouterLink(text, route, classname) // Create router link
```

### BaseModuleApplication
```javascript
// Routes
this.addRoute(path, handler)
this.addRouteWithSubModule(path, handler, file)
this.setDefaultRoute(path)

// Sub-modules
this.setSubModuleBasePath(path) // Set base path for sub JS files 
// Base path may use when addRouteWithSubModule or loadSubModule
this.loadSubModule(filename)    // Load single sub-file
this.loadSubModules([files])    // Load multiple sub-files
this.isSubModuleLoaded(filename) // Check if sub-file is loaded 
// [Normally not used cause addRouteWithSubModule or loadSubModule already handle checking]
```

## 🛣️ Route Patterns

```javascript
// Static routes
''                    // /module
'/feature'            // /module/feature
'/feature/sub'        // /module/feature/sub

// Parameters
'/item/:id'           // /module/item/123 → params.id = "123"
'/user/:userId/post/:postId'  // Multiple params

// ❌ Wrong RouterLink formats
<a routerLink="#module">           // Don't include #
<a routerLink="/module">           // Don't include leading /

// Usage in handlers
async renderDetail(params) {
  const id = params.id
  // Use id...
}
```

## 🔗 RouterLink Patterns
The `routerLink` attribute needs a full relative path without leading slashes or hashes.
```html
<!-- Module navigation -->
<a routerLink="common">Common Module</a> 
<a routerLink="hr/students">HR Students</a>

<!-- With parameters -->
<a routerLink="hr/students/123">Student 123</a>

<!-- Can use in Any element -->
<button routerLink="eval">Evaluation</button>
<div routerLink="project">Project Card</div>
```

## 📦 Sub-Module Patterns

```javascript
// Setup
this.setSubModulePath('/module/static/js/components')

// Auto-load with route
this.addRouteWithSubModule('/advanced', handler, 'Feature.js')

// Manual loading
await this.loadSubModule('Utils.js')
await this.loadSubModules(['A.js', 'B.js'])

// Usage check
if (this.isSubModuleLoaded('Feature.js') && window.Feature) {
  new Feature().enhance(container)
} else {
  this.renderBasicVersion()
}
```

## 🔧 Debugging

```javascript
// Check current state
engine.debugCurrentState()

// Module status
console.log('Loaded:', Array.from(engine.moduleInstances.keys()))

// Sub-module status
const module = engine.moduleInstances.get('ModuleName')
console.log('Sub-modules:', module.getLoadedSubModules())

// Route testing
window.location.hash = 'module/test'
```

## 🎪 URLs Reference

```
/                           → Module menu
/module                     → Module home
/module/feature             → Feature page
/module/feature/sub         → Sub-feature
/module/item/123            → Item detail
/module/item/123/edit       → Edit item
/module/category/x/items    → Category items
```
