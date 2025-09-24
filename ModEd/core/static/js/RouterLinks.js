/**
 * RouterLinks - A utility class for handling router link functionality
 * This class manages navigation links, route changes, and programmatic navigation
 */
class RouterLinks {
  constructor() {
    this.routerLinkObserver = null
    this.initialize()
  }

  /**
   * Initialize the RouterLinks system
   */
  initialize() {
    // Initialize existing router links when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeRouterLinks()
        this.observeRouterLinks()
      })
    } else {
      this.initializeRouterLinks()
      this.observeRouterLinks()
    }
  }

  /**
   * Initialize all existing router links on the page
   */
  initializeRouterLinks() {
    document.querySelectorAll('[routerLink]').forEach((element) => {
      this.setupRouterLink(element)
    })
  }

  /**
   * Set up a single router link element
   * @param {HTMLElement} element - The element to set up as a router link
   */
  setupRouterLink(element) {
    const routerLink = element.getAttribute('routerLink')
    if (!routerLink) return

    // Remove any existing click handlers to avoid duplicates
    if (element._routerLinkHandler) {
      element.removeEventListener('click', element._routerLinkHandler)
    }

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

    // Add hover effects if not already styled
    if (!element.style.transition) {
      element.style.transition = 'opacity 0.2s ease'
    }
  }

  /**
   * Observe DOM changes and automatically set up new router links
   */
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
              node.querySelectorAll('[routerLink]').forEach((element) => {
                this.setupRouterLink(element)
              })
            }
          }
        })
      })
    })

    // Start observing
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        })
      })
    }

    // Store observer for cleanup if needed
    this.routerLinkObserver = observer
  }

  /**
   * Navigate to a specific route programmatically
   * @param {string} route - The route to navigate to
   */
  navigateTo(route) {
    // Handle empty route (go to home/menu)
    if (!route || route === '') {
      window.location.hash = ''
      return
    }

    // Clean the route and set hash
    const cleanRoute = route.startsWith('/') ? route.slice(1) : route
    window.location.hash = cleanRoute
  }

  /**
   * Get current route from URL hash
   * @returns {string|null} Current route path
   */
  getCurrentRoute() {
    const hash = window.location.hash.slice(1) // Remove #

    // Handle both #route and #/route formats
    if (hash) {
      return hash.startsWith('/') ? hash : `/${hash}`
    }

    return null
  }

  createRouterLink(text, path, className = '', attributes = {}) {
    const a = document.createElement('a')
    a.setAttribute('routerLink', path)
    a.textContent = text

    if (className) {
      a.class = className
    }

    // Apply additional attributes
    for (const [key, value] of Object.entries(attributes)) {
      a.setAttribute(key, value)
    }

    // Setup the router link functionality
    this.setupRouterLink(a)

    return a
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RouterLinks
}

// Global instance for easy access
window.RouterLinks = RouterLinks