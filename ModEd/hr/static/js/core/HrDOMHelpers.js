// HR DOM Helper Utilities - Create DOM elements without HTML strings
if (typeof window !== 'undefined' && !window.HrDOMHelpers) {
  class HrDOMHelpers {
    /**
     * Create an element with attributes and children
     * @param {string} tag - HTML tag name
     * @param {object} options - Element options
     * @param {string} options.className - CSS classes
     * @param {string} options.id - Element ID
     * @param {object} options.attributes - Additional attributes
     * @param {Array|Node|string} options.children - Child elements or text
     * @param {string} options.textContent - Text content
     * @param {function} options.onClick - Click handler
     * @returns {HTMLElement}
     */
    static createElement(tag, options = {}) {
      const element = document.createElement(tag);
      
      if (options.className) {
        element.className = options.className;
      }
      
      if (options.id) {
        element.id = options.id;
      }
      
      if (options.textContent) {
        element.textContent = options.textContent;
      }
      
      if (options.onClick) {
        element.addEventListener('click', options.onClick);
      }
      
      // Set additional attributes
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          if (key === 'onclick') {
            element.setAttribute(key, value);
          } else {
            element.setAttribute(key, value);
          }
        });
      }
      
      // Append children
      if (options.children) {
        if (Array.isArray(options.children)) {
          options.children.forEach(child => {
            if (child instanceof Node) {
              element.appendChild(child);
            } else if (typeof child === 'string') {
              element.appendChild(document.createTextNode(child));
            }
          });
        } else if (options.children instanceof Node) {
          element.appendChild(options.children);
        } else if (typeof options.children === 'string') {
          element.appendChild(document.createTextNode(options.children));
        }
      }
      
      return element;
    }

    /**
     * Create a button element
     */
    static createButton(options = {}) {
      return this.createElement('button', {
        className: options.className || '',
        type: options.type || 'button',
        textContent: options.text,
        onClick: options.onClick,
        attributes: options.attributes || {},
        children: options.children
      });
    }

    /**
     * Create a div element
     */
    static createDiv(options = {}) {
      return this.createElement('div', options);
    }

    /**
     * Create a paragraph element
     */
    static createParagraph(options = {}) {
      return this.createElement('p', options);
    }

    /**
     * Create a heading element
     */
    static createHeading(level, options = {}) {
      return this.createElement(`h${level}`, options);
    }

    /**
     * Create an error page structure
     */
    static createErrorPage(options = {}) {
      const {
        message = 'An error occurred',
        title = 'Error Loading Form',
        retryText = 'Retry',
        backText = 'Back to Main',
        backUrl = '/hr',
        retryButtonClass = '',
        backButtonClass = ''
      } = options;

      // Main container
      const container = this.createDiv({
        className: 'min-h-screen bg-gray-50 py-8'
      });

      // Inner wrapper
      const wrapper = this.createDiv({
        className: 'max-w-4xl mx-auto px-4',
        children: [
          // Error card
          this.createDiv({
            className: 'bg-red-50 border border-red-200 rounded-lg p-6',
            children: [
              // Title
              this.createHeading(2, {
                className: 'text-lg font-semibold text-red-800',
                textContent: title
              }),
              // Message
              this.createParagraph({
                className: 'text-red-600 mt-2',
                textContent: message
              }),
              // Buttons container
              this.createDiv({
                className: 'mt-4',
                children: [
                  // Retry button
                  this.createButton({
                    className: retryButtonClass || 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700',
                    text: retryText,
                    attributes: {
                      onclick: 'window.location.reload()'
                    }
                  }),
                  // Back button
                  this.createButton({
                    className: backButtonClass || 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ml-3',
                    text: backText,
                    attributes: {
                      onclick: `window.location.href='${backUrl}'`
                    }
                  })
                ]
              })
            ]
          })
        ]
      });

      container.appendChild(wrapper);
      return container;
    }

    /**
     * Create select dropdown with options
     */
    static createSelect(options = {}) {
      const select = this.createElement('select', {
        name: options.name,
        id: options.id,
        className: options.className || 'w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
      });

      // Add default option
      if (options.placeholder) {
        const defaultOption = this.createElement('option', {
          value: '',
          textContent: options.placeholder
        });
        select.appendChild(defaultOption);
      }

      // Add options
      if (options.options && Array.isArray(options.options)) {
        options.options.forEach(option => {
          const optionElement = this.createElement('option', {
            value: option.value || option,
            textContent: option.label || option.text || option
          });
          if (option.selected) {
            optionElement.selected = true;
          }
          select.appendChild(optionElement);
        });
      }

      // Set current value
      if (options.value !== undefined) {
        select.value = options.value;
      }

      return select;
    }

    /**
     * Create an input element
     */
    static createInput(options = {}) {
      const input = this.createElement('input', {
        type: options.type || 'text',
        name: options.name,
        id: options.id,
        className: options.className || 'w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
        attributes: {
          placeholder: options.placeholder || '',
          ...(options.required ? { required: '' } : {}),
          ...(options.value ? { value: options.value } : {}),
          ...(options.attributes || {})
        }
      });
      return input;
    }

    /**
     * Create a label element
     */
    static createLabel(options = {}) {
      return this.createElement('label', {
        className: options.className || 'block text-sm font-medium mb-1',
        textContent: options.text,
        attributes: {
          for: options.for || options.htmlFor || ''
        }
      });
    }

    /**
     * Clear container and append new content
     */
    static replaceContent(container, element) {
      if (!container) return;
      container.innerHTML = '';
      if (element instanceof Node) {
        container.appendChild(element);
      } else if (Array.isArray(element)) {
        element.forEach(el => {
          if (el instanceof Node) {
            container.appendChild(el);
          }
        });
      }
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrDOMHelpers = HrDOMHelpers;
  }
}

