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
      const labelOptions = {
        className: options.className || 'block text-sm font-medium mb-1',
        attributes: {
          for: options.for || options.htmlFor || ''
        }
      };
      
      // Use children if provided, otherwise use text
      if (options.children) {
        labelOptions.children = options.children;
      } else if (options.text) {
        labelOptions.textContent = options.text;
      }
      
      return this.createElement('label', labelOptions);
    }

    /**
     * Create a textarea element
     */
    static createTextarea(options = {}) {
      const textarea = this.createElement('textarea', {
        name: options.name,
        id: options.id,
        className: options.className || 'w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
        attributes: {
          placeholder: options.placeholder || '',
          rows: options.rows || '4',
          ...(options.required ? { required: '' } : {}),
          ...(options.attributes || {})
        }
      });
      if (options.value) {
        textarea.value = options.value;
      }
      return textarea;
    }

    /**
     * Create SVG icon with path
     */
    static createIcon(path, options = {}) {
      const icon = this.createElement('svg', {
        className: options.className || 'w-5 h-5',
        attributes: {
          fill: options.fill || 'none',
          stroke: options.stroke || 'currentColor',
          viewBox: options.viewBox || '0 0 24 24'
        }
      });
      
      const pathElement = this.createElement('path', {
        attributes: {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': options.strokeWidth || '2',
          d: path
        }
      });
      
      icon.appendChild(pathElement);
      return icon;
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

    /**
     * Create a table element
     */
    static createTable(options = {}) {
      return this.createElement('table', {
        className: options.className || 'min-w-full divide-y divide-gray-200',
        children: options.children
      });
    }

    /**
     * Create a table header element
     */
    static createTableHead(options = {}) {
      return this.createElement('thead', {
        className: options.className || 'bg-gray-50',
        children: options.children
      });
    }

    /**
     * Create a table body element
     */
    static createTableBody(options = {}) {
      return this.createElement('tbody', {
        className: options.className || 'bg-white divide-y divide-gray-200',
        children: options.children
      });
    }

    /**
     * Create a table row element
     */
    static createTableRow(options = {}) {
      return this.createElement('tr', {
        className: options.className,
        children: options.children
      });
    }

    /**
     * Create a table header cell element
     */
    static createTableHeader(options = {}) {
      return this.createElement('th', {
        className: options.className || 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        children: options.children,
        textContent: options.text
      });
    }

    /**
     * Create a table cell element
     */
    static createTableCell(options = {}) {
      return this.createElement('td', {
        className: options.className || 'px-6 py-4 whitespace-nowrap text-sm',
        children: options.children,
        textContent: options.text
      });
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrDOMHelpers = HrDOMHelpers;
  }
}

