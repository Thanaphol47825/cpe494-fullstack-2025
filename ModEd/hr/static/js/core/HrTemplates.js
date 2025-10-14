// HR Templates Registry - Centralized Templates using Mustache
if (typeof window !== 'undefined' && !window.HrTemplates) {
  class HrTemplates {
    constructor() {
      this.templates = {};
      this.iconPaths = this.initIconPaths();
      this.initializeTemplates();
    }

    initIconPaths() {
      return {
        instructor: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>',
        student: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>',
        add: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>',
        edit: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>',
        save: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
        cancel: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
        reset: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>',
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        loading: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>',
        view: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>',
        back: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>',
        trash: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>',
        department: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>',
        email: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>',
        calendar: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
        money: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>'
      };
    }

    initializeTemplates() {
      // ========================================
      // Partial Templates (Building Blocks)
      // ========================================
      
      this.templates.pageHeader = `
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}} rounded-full mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {{{icon}}}
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{{title}}</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">{{description}}</p>
        </div>
      `;

      this.templates.formCard = `
        <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div class="px-8 py-6 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}}">
            <h2 class="text-2xl font-semibold text-white flex items-center">
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{formTitle}}
            </h2>
          </div>
          <div class="p-8">
            <div class="{{containerClass}}">
              <!-- Dynamic form will be inserted here by AdvanceFormRender -->
            </div>
          </div>
        </div>
      `;

      this.templates.resultBox = `
        <div id="formResultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div id="formResultHeader" class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <span id="formResultIcon" class="mr-2"></span>
              <span id="formResultTitle">Result</span>
            </h3>
          </div>
          <div class="p-6">
            <div id="formResultContent"></div>
          </div>
        </div>
      `;

      this.templates.backButton = `
        <div class="text-center mt-8">
          <a routerLink="{{backLink}}" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {{{iconBack}}}
            </svg>
            {{backLabel}}
          </a>
        </div>
      `;

      // ========================================
      // Page Layout Templates
      // ========================================
      
      this.templates.formPageLayout = `
        <div class="min-h-screen bg-gradient-to-br {{bgGradient}} py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {{> pageHeader}}
            {{> formCard}}
            {{> resultBox}}
            {{> backButton}}
          </div>
        </div>
      `;

      this.templates.editFormPageLayout = `
        <div class="min-h-screen bg-gradient-to-br {{bgGradient}} py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {{> pageHeader}}
            {{> formCard}}
            {{> resultBox}}
            {{> backButton}}
          </div>
        </div>
      `;

      this.templates.loadingStatePage = `
        <div class="min-h-screen bg-gradient-to-br {{bgGradient}} py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}} rounded-full mb-6">
                <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconLoading}}}
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-4">{{title}}</h1>
              <p class="text-gray-600">{{message}}</p>
            </div>
          </div>
        </div>
      `;

      // ========================================
      // Message Templates
      // ========================================

      this.templates.successMessage = `
        <div class="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {{{iconSuccess}}}
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-green-800">Success!</h3>
            <p class="text-green-600">{{message}}</p>
            {{#hasData}}
            <details class="mt-2">
              <summary class="cursor-pointer text-sm text-green-700 hover:text-green-800">View Details</summary>
              <pre class="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto">{{dataJson}}</pre>
            </details>
            {{/hasData}}
          </div>
        </div>
      `;

      this.templates.errorMessage = `
        <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {{{iconError}}}
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Error</h3>
            <p class="text-red-600">{{message}}</p>
          </div>
        </div>
      `;

      // ========================================
      // Card Templates
      // ========================================

      this.templates.instructorCard = `
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg mb-6">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconInstructor}}}
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">{{fullName}}</h3>
                  <p class="text-sm text-gray-600">Code: {{instructorCode}}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconSuccess}}}
                  </svg>
                  Active
                </span>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconDepartment}}}
                  </svg>
                  <span class="font-medium">Department:</span> {{department}}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconEmail}}}
                  </svg>
                  <span class="font-medium">Email:</span> {{email}}
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconCalendar}}}
                  </svg>
                  <span class="font-medium">Start Date:</span> {{startDate}}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconMoney}}}
                  </svg>
                  <span class="font-medium">Salary:</span> {{salary}}
                </div>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <button onclick="hrApp.viewInstructor('{{instructorCode}}')" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconView}}}
                </svg>
                View Details
              </button>
              <button onclick="hrApp.editInstructor('{{instructorCode}}')" class="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconEdit}}}
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      `;

      this.templates.studentCard = `
        <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg mb-6">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconStudent}}}
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">{{fullName}}</h3>
                  <p class="text-sm text-gray-600">Code: {{studentCode}}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {{statusClass}}">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconSuccess}}}
                  </svg>
                  {{status}}
                </span>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconStudent}}}
                  </svg>
                  <span class="font-medium">Program:</span> {{program}}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconEmail}}}
                  </svg>
                  <span class="font-medium">Email:</span> {{email}}
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconCalendar}}}
                  </svg>
                  <span class="font-medium">Start Date:</span> {{startDate}}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-medium">Year:</span> {{year}}
                </div>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <button onclick="hrApp.viewStudent('{{studentCode}}')" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconView}}}
                </svg>
                View Details
              </button>
              <button onclick="hrApp.editStudent('{{studentCode}}')" class="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconEdit}}}
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      `;

      this.templates.emptyState = `
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {{{icon}}}
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{title}}</h3>
          <p class="text-gray-600 mb-6">{{message}}</p>
          {{#hasAction}}
          <a routerLink="{{actionLink}}" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {{{iconAdd}}}
            </svg>
            {{actionLabel}}
          </a>
          {{/hasAction}}
        </div>
      `;

      // ========================================
      // Leave Management Templates
      // ========================================

      this.templates.leaveListPage = `
        <div class="min-h-screen bg-gradient-to-br {{bgGradient}} py-8">
          <div class="max-w-7xl mx-auto px-4">
            {{> pageHeader}}

            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div class="flex flex-wrap gap-3">
                {{#actions}}
                <a routerLink="{{route}}" class="{{className}}">
                  {{#icon}}
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{icon}}}
                  </svg>
                  {{/icon}}
                  {{label}}
                </a>
                {{/actions}}
              </div>
              {{#showRefresh}}
              <button id="{{refreshId}}" class="{{refreshClass}}">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconReset}}}
                </svg>
                {{refreshLabel}}
              </button>
              {{/showRefresh}}
            </div>

            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
              {{#hasRequests}}
                {{> leaveRequestsTable}}
              {{/hasRequests}}
              {{^hasRequests}}
                {{> leaveRequestsEmpty}}
              {{/hasRequests}}
            </div>

            <div class="mt-6 text-center">
              <a routerLink="{{backRoute}}" class="text-blue-600 hover:underline">
                ← Back to Leave Management
              </a>
            </div>
          </div>
        </div>
        {{> leaveReviewModal}}
      `;

      this.templates.leaveRequestsTable = `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                {{#columns}}
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{{label}}</th>
                {{/columns}}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {{#requests}}
                {{> leaveRequestRow}}
              {{/requests}}
            </tbody>
          </table>
        </div>
      `;

      this.templates.leaveRequestRow = `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 text-sm text-gray-900">#{{id}}</td>
          <td class="px-6 py-4 text-sm font-medium text-gray-900">{{personLabel}}</td>
          <td class="px-6 py-4 text-sm text-gray-700">{{leaveType}}</td>
          <td class="px-6 py-4 text-sm text-gray-700">{{leaveDate}}</td>
          <td class="px-6 py-4">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {{statusClass}}">
              {{status}}
            </span>
          </td>
          <td class="px-6 py-4 text-sm">
            <div class="flex flex-wrap gap-2">
              {{#actions}}
                {{#isLink}}
                  <a routerLink="{{route}}" class="{{className}}" data-id="{{id}}">
                    {{label}}
                  </a>
                {{/isLink}}
                {{#isButton}}
                  <button 
                    class="{{className}}" 
                    data-id="{{id}}" 
                    data-action="{{action}}" 
                    {{#actionType}}data-action-type="{{actionType}}"{{/actionType}}
                  >
                    {{label}}
                  </button>
                {{/isButton}}
              {{/actions}}
            </div>
          </td>
        </tr>
      `;

      this.templates.leaveRequestsEmpty = `
        <div class="p-12 text-center">
          <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">{{emptyTitle}}</h3>
          <p class="text-gray-500 mb-6">{{emptyMessage}}</p>
          <a 
            routerLink="{{emptyActionRoute}}" 
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700"
          >
            {{emptyActionLabel}}
          </a>
        </div>
      `;

      this.templates.leaveReviewModal = `
        <div id="{{modalId}}" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">{{modalTitle}}</h3>
            <p id="{{modalMessageId}}" class="text-gray-600 mb-4">{{modalMessage}}</p>
            <textarea 
              id="{{reasonFieldId}}" 
              placeholder="{{reasonPlaceholder}}" 
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
            <div class="flex gap-3 pt-4">
              <button 
                id="{{confirmButtonId}}" 
                class="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"
              >
                {{confirmLabel}}
              </button>
              <button 
                id="{{cancelButtonId}}" 
                class="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                {{cancelLabel}}
              </button>
            </div>
          </div>
        </div>
      `;

      this.templates.studentLeaveForm = `
        <form id="{{formId}}" class="space-y-6">
          <div>
            <label for="student_code" class="block text-sm font-medium text-gray-700 mb-2">
              Student <span class="text-red-500">*</span>
            </label>
            <select 
              id="student_code" 
              name="student_code" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a student</option>
              {{#students}}
                <option value="{{value}}" {{#selected}}selected{{/selected}}>
                  {{label}}
                </option>
              {{/students}}
            </select>
          </div>

          <div>
            <label for="leave_type" class="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span class="text-red-500">*</span>
            </label>
            <select 
              id="leave_type" 
              name="leave_type" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select leave type</option>
              {{#leaveTypes}}
                <option value="{{value}}" {{#selected}}selected{{/selected}}>
                  {{label}}
                </option>
              {{/leaveTypes}}
            </select>
          </div>

          <div>
            <label for="leave_date" class="block text-sm font-medium text-gray-700 mb-2">
              Leave Date <span class="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              id="leave_date" 
              name="leave_date" 
              value="{{leaveDate}}"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
              Reason <span class="text-red-500">*</span>
            </label>
            <textarea 
              id="reason" 
              name="reason" 
              rows="4" 
              required
              placeholder="Please provide a detailed reason for the leave request..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            >{{reason}}</textarea>
          </div>

          <div id="{{statusContainerId}}" class="hidden"></div>

          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
            >
              {{submitLabel}}
            </button>
            <a 
              routerLink="{{cancelRoute}}" 
              class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 text-center"
            >
              {{cancelLabel}}
            </a>
            {{#showDelete}}
            <button 
              type="button" 
              id="{{deleteButtonId}}" 
              class="flex-1 bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
            >
              {{deleteLabel}}
            </button>
            {{/showDelete}}
          </div>
        </form>
      `;

      this.templates.instructorLeaveForm = `
        <form id="{{formId}}" class="space-y-6">
          <div>
            <label for="instructor_code" class="block text-sm font-medium text-gray-700 mb-2">
              Instructor <span class="text-red-500">*</span>
            </label>
            <select 
              id="instructor_code" 
              name="InstructorCode" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an instructor</option>
              {{#instructors}}
                <option value="{{value}}" {{#selected}}selected{{/selected}}>
                  {{label}}
                </option>
              {{/instructors}}
            </select>
          </div>

          <div>
            <label for="leave_type" class="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span class="text-red-500">*</span>
            </label>
            <select 
              id="leave_type" 
              name="LeaveType" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select leave type</option>
              {{#leaveTypes}}
                <option value="{{value}}" {{#selected}}selected{{/selected}}>
                  {{label}}
                </option>
              {{/leaveTypes}}
            </select>
          </div>

          <div>
            <label for="leave_date" class="block text-sm font-medium text-gray-700 mb-2">
              Leave Date <span class="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              id="leave_date" 
              name="DateStr" 
              value="{{leaveDate}}"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
              Reason <span class="text-red-500">*</span>
            </label>
            <textarea 
              id="reason" 
              name="Reason" 
              rows="4" 
              required
              placeholder="Please provide a detailed reason for the leave request..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            >{{reason}}</textarea>
          </div>

          <div id="{{statusContainerId}}" class="hidden"></div>

          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200"
            >
              {{submitLabel}}
            </button>
            <a 
              routerLink="{{cancelRoute}}" 
              class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 text-center"
            >
              {{cancelLabel}}
            </a>
          </div>
        </form>
      `;

      // ========================================
      // Resignation Card Templates
      // ========================================

      this.templates.studentResignationCard = `
        <div class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg mb-4 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">Student: {{studentCode}}</h4>
              <p class="text-sm text-gray-600 mt-1">Reason: {{reason}}</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {{statusClass}}">{{status}}</span>
          </div>
          <div class="mt-3 text-sm text-gray-500">Requested At: {{requestedAt}}</div>
          <div class="mt-4 flex gap-3">
            <a routerLink="hr/resignation/student/{{id}}" class="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">View</a>
          </div>
        </div>
      `;

      this.templates.instructorResignationCard = `
        <div class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg mb-4 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">Instructor: {{instructorCode}}</h4>
              <p class="text-sm text-gray-600 mt-1">Reason: {{reason}}</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {{statusClass}}">{{status}}</span>
          </div>
          <div class="mt-3 text-sm text-gray-500">Requested At: {{requestedAt}}</div>
          <div class="mt-4 flex gap-3">
            <a routerLink="hr/resignation/instructor/{{id}}" class="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">View</a>
            {{#isPending}}
            <button onclick="window.instructorResignationList.approveRequest({{id}})" 
                    class="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {{{iconSave}}}
              </svg>
              Approve
            </button>
            <button onclick="window.instructorResignationList.rejectRequest({{id}})" 
                    class="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {{{iconCancel}}}
              </svg>
              Reject
            </button>
            {{/isPending}}
          </div>
        </div>
      `;

      // ========================================
      // Error Page Templates
      // ========================================

      this.templates.errorPage = `
        <div class="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
              <div class="px-8 py-6 bg-gradient-to-r from-red-600 to-pink-600">
                <h2 class="text-2xl font-semibold text-white">{{title}}</h2>
              </div>
              <div class="p-8">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p class="text-red-700 mb-4">{{message}}</p>
                  {{#hasRetry}}
                  <button onclick="{{retryAction}}" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button>
                  {{/hasRetry}}
                </div>
              </div>
            </div>
            <div class="text-center mt-8">
              <a routerLink="{{backLink}}" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← {{backLabel}}</a>
            </div>
          </div>
        </div>
      `;

      this.templates.detailedErrorPage = `
        <div class="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconError}}}
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{title}}</h1>
              <p class="text-lg text-red-600">{{subtitle}}</p>
            </div>

            <div class="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
              <div class="px-8 py-6 bg-gradient-to-r from-red-600 to-pink-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconError}}}
                  </svg>
                  Error Details
                </h2>
              </div>
              
              <div class="p-8">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div class="flex items-start">
                    <svg class="w-6 h-6 text-red-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {{{iconError}}}
                    </svg>
                    <div>
                      <h3 class="text-lg font-semibold text-red-800 mb-2">{{errorTitle}}</h3>
                      <p class="text-red-700 mb-4">{{errorMessage}}</p>
                      {{#hasRetry}}
                      <button onclick="{{retryAction}}" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {{{iconReset}}}
                        </svg>
                        Try Again
                      </button>
                      {{/hasRetry}}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center mt-8">
              <a routerLink="{{backLink}}" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconBack}}}
                </svg>
                {{backLabel}}
              </a>
            </div>
          </div>
        </div>
      `;

      this.templates.featureLoadingPage = `
        <div class="min-h-screen bg-gradient-to-br {{bgGradient}} py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}} rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{icon}}}
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">{{title}}</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">{{message}}</p>
            </div>
            
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}}">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  {{loadingTitle}}
                </h2>
              </div>
              
              <div class="p-8">
                <div class="text-center py-16">
                  <div class="inline-block w-12 h-12 border-4 border-{{colorName}}-200 border-t-{{colorName}}-600 rounded-full animate-spin mb-4"></div>
                  <p class="text-lg text-gray-600">{{loadingMessage}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.templates.featureErrorPage = `
        <div class="min-h-screen bg-gradient-to-br {{bgGradient}} py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {{{iconError}}}
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">{{title}}</h1>
              <p class="text-xl text-red-600 max-w-2xl mx-auto">{{errorMessage}}</p>
            </div>
            
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-red-600 to-pink-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {{{iconError}}}
                  </svg>
                  Error Loading Form
                </h2>
              </div>
              
              <div class="p-8">
                <div class="text-center py-16">
                  <p class="text-lg text-gray-600">{{helpMessage}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Render a template with data using Mustache
     * @param {string} templateName - Name of template to render
     * @param {object} data - Data to pass to template
     * @param {object} customPartials - Additional partial templates
     * @returns {string} Rendered HTML
     */
    render(templateName, data = {}, customPartials = {}) {
      const template = this.templates[templateName];
      if (!template) {
        console.error(`Template "${templateName}" not found`);
        return '';
      }

      // Merge icon paths into data for easy access
      const enrichedData = {
        ...data,
        iconInstructor: this.iconPaths.instructor,
        iconStudent: this.iconPaths.student,
        iconAdd: this.iconPaths.add,
        iconEdit: this.iconPaths.edit,
        iconSave: this.iconPaths.save,
        iconCancel: this.iconPaths.cancel,
        iconReset: this.iconPaths.reset,
        iconSuccess: this.iconPaths.success,
        iconError: this.iconPaths.error,
        iconLoading: this.iconPaths.loading,
        iconView: this.iconPaths.view,
        iconBack: this.iconPaths.back,
        iconTrash: this.iconPaths.trash,
        iconDepartment: this.iconPaths.department,
        iconEmail: this.iconPaths.email,
        iconCalendar: this.iconPaths.calendar,
        iconMoney: this.iconPaths.money
      };

      // Use Mustache if available
      if (typeof Mustache !== 'undefined') {
        const allPartials = { ...this.templates, ...customPartials };
        return Mustache.render(template, enrichedData, allPartials);
      } else {
        console.warn('Mustache not available, using simple rendering');
        return this.simpleRender(template, enrichedData);
      }
    }

    /**
     * Simple template rendering fallback (when Mustache not available)
     */
    simpleRender(template, data) {
      let result = template;
      
      // Replace variables
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const tripleRegex = new RegExp(`{{{${key}}}}`, 'g');
        result = result.replace(tripleRegex, value || '');
        result = result.replace(regex, value || '');
      }
      
      // Remove conditionals (simple fallback)
      result = result.replace(/{{#\w+}}[\s\S]*?{{\/\w+}}/g, '');
      result = result.replace(/{{>\s*\w+}}/g, '');
      
      return result;
    }

    /**
     * Get template string without rendering
     */
    get(templateName) {
      return this.templates[templateName] || '';
    }

    /**
     * Register a new template
     */
    register(name, template) {
      this.templates[name] = template;
    }

    /**
     * Check if template exists
     */
    has(templateName) {
      return templateName in this.templates;
    }

    /**
     * Get all template names
     */
    list() {
      return Object.keys(this.templates);
    }

    /**
     * Helper: Get status badge class based on status
     */
    getStatusClass(status) {
      const statusLower = (status || '').toLowerCase();
      if (statusLower === 'approved' || statusLower === 'active') {
        return 'bg-green-100 text-green-800';
      } else if (statusLower === 'rejected') {
        return 'bg-red-100 text-red-800';
      } else {
        return 'bg-yellow-100 text-yellow-800';
      }
    }

    /**
     * Helper: Format date to locale string
     */
    formatDate(dateString) {
      if (!dateString) return 'Not specified';
      const date = new Date(dateString);
      return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid date';
    }

    /**
     * Helper: Format currency
     */
    formatCurrency(amount) {
      if (!amount) return 'Not specified';
      return `฿${Number(amount).toLocaleString()}`;
    }

    /**
     * Helper: Get full name from first and last name
     */
    getFullName(firstName, lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown';
    }
  }

  // Create singleton instance
  window.HrTemplates = new HrTemplates();
}
