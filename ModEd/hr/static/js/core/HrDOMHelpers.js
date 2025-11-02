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

    /**
     * Create SVG icon element
     */
    static createIcon(path, className = '') {
      const svg = document.createElement('svg');
      svg.className = className;
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.innerHTML = path;
      return svg;
    }

    /**
     * Create list page layout (Student/Instructor list page structure)
     */
    static createListPageLayout(options = {}) {
      const {
        title = 'List',
        description = '',
        iconPath = '',
        bgGradient = 'from-green-50 via-emerald-50 to-teal-50',
        headerGradient = 'from-green-600 to-teal-600',
        cardGradient = 'from-green-500 to-teal-600',
        addButtonText = 'Add New',
        addButtonLink = '',
        addButtonClass = '',
        tableContainerId = 'tableContainer',
        backButtonLink = 'hr',
        backButtonText = 'Back to HR Menu',
        backButtonClass = ''
      } = options;

      // Main container
      const mainContainer = this.createDiv({
        className: `min-h-screen bg-gradient-to-br ${bgGradient} py-8`
      });

      // Inner wrapper
      const wrapper = this.createDiv({
        className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      });

      // Header section
      const header = this.createDiv({
        className: 'text-center mb-12',
        children: [
          // Icon circle
          this.createDiv({
            className: `inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${headerGradient} rounded-full mb-6`,
            children: [
              iconPath ? this.createIcon(iconPath, 'w-8 h-8 text-white') : null
            ].filter(Boolean)
          }),
          // Title
          this.createHeading(1, {
            className: 'text-4xl font-bold text-gray-900 mb-4',
            textContent: title
          }),
          // Description
          this.createParagraph({
            className: 'text-xl text-gray-600 max-w-2xl mx-auto',
            textContent: description
          })
        ]
      });

      // Action bar
      const actionBar = this.createDiv({
        className: 'flex justify-end mb-6',
        children: [
          this.createElement('a', {
            className: addButtonClass || 'inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-md hover:shadow-lg',
            attributes: {
              routerLink: addButtonLink,
              href: `#${addButtonLink}`
            },
            children: [
              this.createIcon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>', 'w-5 h-5 mr-2'),
              document.createTextNode(addButtonText)
            ]
          })
        ]
      });

      // Table card
      const tableCard = this.createDiv({
        className: 'bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8',
        children: [
          // Card header
          this.createDiv({
            className: `px-8 py-6 bg-gradient-to-r ${cardGradient}`,
            children: [
              this.createHeading(2, {
                className: 'text-2xl font-semibold text-white flex items-center',
                children: [
                  iconPath ? this.createIcon(iconPath, 'w-6 h-6 mr-3') : null,
                  document.createTextNode('Current ' + title.replace(' Management', ''))
                ].filter(Boolean)
              })
            ]
          }),
          // Card body
          this.createDiv({
            className: 'p-8',
            children: [
              this.createDiv({
                id: tableContainerId
              })
            ]
          })
        ]
      });

      // Back button
      const backButtonContainer = this.createDiv({
        className: 'text-center',
        children: [
          this.createElement('a', {
            className: backButtonClass || 'inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg',
            attributes: {
              routerLink: backButtonLink,
              href: `#${backButtonLink}`
            },
            children: [
              this.createIcon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>', 'w-5 h-5 mr-2'),
              document.createTextNode(backButtonText)
            ]
          })
        ]
      });

      // Assemble
      wrapper.appendChild(header);
      wrapper.appendChild(actionBar);
      wrapper.appendChild(tableCard);
      wrapper.appendChild(backButtonContainer);
      mainContainer.appendChild(wrapper);

      return mainContainer;
    }

    /**
     * Create table row for student/instructor
     */
    static createTableRow(data, columns, actions = null) {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50 transition-colors';

      columns.forEach(col => {
        const cell = document.createElement('td');
        cell.className = col.className || 'px-6 py-4 whitespace-nowrap text-sm';
        
        if (col.type === 'actions' && actions) {
          cell.className += ' text-center text-sm font-medium';
          const actionsContainer = this.createDiv({
            className: 'flex gap-2 justify-center',
            children: actions
          });
          cell.appendChild(actionsContainer);
        } else {
          const value = col.getValue ? col.getValue(data) : (data[col.field] || 'N/A');
          cell.textContent = value;
          if (col.fontWeight) {
            cell.className += ' ' + col.fontWeight;
          }
          if (col.textColor) {
            cell.className += ' ' + col.textColor;
          }
        }
        
        row.appendChild(cell);
      });

      return row;
    }

    /**
     * Create action button (Edit/Delete)
     */
    static createActionButton(type, onClick, code, text) {
      const button = document.createElement('button');
      
      let iconPath, bgClass, textClass;
      if (type === 'edit') {
        iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>';
        bgClass = 'bg-yellow-50 text-yellow-700';
        hoverClass = 'hover:bg-yellow-100';
      } else if (type === 'delete') {
        iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>';
        bgClass = 'bg-red-50 text-red-700';
        hoverClass = 'hover:bg-red-100';
      }

      button.className = `inline-flex items-center px-3 py-1.5 ${bgClass} text-sm rounded-lg ${hoverClass} transition-colors`;
      button.type = 'button';
      
      const icon = this.createIcon(iconPath, 'w-4 h-4 mr-1');
      button.appendChild(icon);
      button.appendChild(document.createTextNode(text));
      
      if (onClick) {
        button.addEventListener('click', () => onClick(code));
      }

      return button;
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrDOMHelpers = HrDOMHelpers;
  }
}

