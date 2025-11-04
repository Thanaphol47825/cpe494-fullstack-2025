<div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-6">
            <button id="back-to-list" class="text-blue-600 hover:text-blue-800 text-sm flex items-center mb-4">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to List
            </button>
            <h1 class="text-3xl font-bold text-gray-900">Edit Intern Student</h1>
            <p class="mt-2 text-sm text-gray-600">Update intern student information and manage work experiences</p>
        </div>

        <!-- Loading State -->
        <div id="loading-form" class="bg-white rounded-lg shadow p-6 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading form...</p>
        </div>

        <!-- Error State -->
        <div id="status-container"></div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Basic Info -->
            <div id="edit-form-container" class="hidden bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <form id="intern-student-edit-form" class="space-y-6">
                    <!-- Current Student Info (Read-only display) -->
                    <div id="current-student-info" class="bg-gray-50 rounded-lg p-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-3">Student Information</h4>
                        <div class="grid grid-cols-1 gap-4 text-sm">
                            <div>
                                <span class="text-gray-600">Code:</span>
                                <span id="current-student-code" class="ml-2 font-medium">-</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Name:</span>
                                <span id="current-student-name" class="ml-2 font-medium">-</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Email:</span>
                                <span id="current-student-email" class="ml-2 font-medium">-</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Phone:</span>
                                <span id="current-student-phone" class="ml-2 font-medium">-</span>
                            </div>
                        </div>
                    </div>

                    <!-- Intern Status -->
                    <div>
                        <label for="intern_status" class="block text-sm font-medium text-gray-700 mb-2">
                            Intern Status <span class="text-red-500">*</span>
                        </label>
                        <select id="intern_status" name="intern_status" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        <p class="mt-1 text-sm text-gray-500">Current status of the internship</p>
                    </div>

                    <!-- Overview -->
                    <div>
                        <label for="overview" class="block text-sm font-medium text-gray-700 mb-2">
                            Overview
                        </label>
                        <textarea id="overview" name="overview" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Enter internship overview or description..."></textarea>
                        <p class="mt-1 text-sm text-gray-500">Brief description of the internship (optional)</p>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Cancel
                        </button>
                        <button type="submit" id="update-btn" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span id="update-btn-text">Update Intern Student</span>
                            <svg id="update-btn-spinner" class="hidden animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Right Column: Work Experience, Project, Skill, Certificate -->
            <div class="col-span-2 grid grid-cols-2 gap-4">
                {{{sectionsHTML}}}
            </div>
        </div>
    </div>
</div>