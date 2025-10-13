if (typeof window !== 'undefined' && !window.InternStudentEdit) {
    class InternStudentEdit {
        constructor(application, internId) {
            this.application = application;
            this.internId = internId;
            this.internData = null;
            this.students = [];
            this.workExperiences = [];
            this.skills = [];
            this.certificates = [];
            this.projects = [];
        }

        async render() {
            console.log("Rendering Intern Student Edit Form for ID:", this.internId);
            
            // Set global instance for onclick handlers
            window.internStudentEdit = this;
            
            // Clear the container
            this.application.mainContainer.innerHTML = '';

            // Load existing intern data and work experiences
            await this.loadData();

            // Create the main page layout
            const pageHTML = this.createPageHTML();
            const pageWrapper = this.application.create(pageHTML);
            this.application.mainContainer.appendChild(pageWrapper);

            // Initialize event listeners
            this.setupEventListeners();

            // Populate form with existing data
            this.populateForm();
        }

        async loadData() {
            try {
                // Load intern data (which already contains Student data)
                const internResponse = await fetch(`/curriculum/InternStudent/${this.internId}`);
                const internData = await internResponse.json();
                
                if (internData.isSuccess) {
                    this.internData = internData.result;
                    this.students = this.internData.Student ? [this.internData.Student] : [];
                    
                    // Load work experiences, skills, certificates, and projects for this student
                    await this.loadWorkExperiences();
                    await this.loadSkills();
                    await this.loadCertificates();
                    await this.loadProjects();
                } else {
                    throw new Error(internData.error || 'Failed to load intern student data');
                }
            } catch (error) {
                console.error('Error loading data:', error);
                throw error;
            }
        }

        async loadWorkExperiences() {
            try {
                // Get work experiences for this student
                const studentId = this.internData.ID;
                if (!studentId) return;

                const response = await fetch(`/curriculum/internWorkExperience/getByStudentID/${studentId}`);
                const data = await response.json();
                
                if (data.isSuccess) {
                    this.workExperiences = data.result || [];
                } else {
                    console.warn('Failed to load work experiences:', data.error);
                    this.workExperiences = [];
                }
            } catch (error) {
                console.error('Error loading work experiences:', error);
                this.workExperiences = [];
            }
        }

        async loadSkills() {
            try {
                // Get skills for this student
                const studentId = this.internData.ID;
                if (!studentId) return;

                const response = await fetch(`/curriculum/internSkill/getByStudentID/${studentId}`);
                const data = await response.json();
                
                if (data.isSuccess) {
                    this.skills = data.result || [];
                } else {
                    console.warn('Failed to load skills:', data.error);
                    this.skills = [];
                }
            } catch (error) {
                console.error('Error loading skills:', error);
                this.skills = [];
            }
        }

        async loadCertificates() {
            try {
                // Get certificates for this student
                const studentId = this.internData.ID;
                if (!studentId) return;

                const response = await fetch(`/curriculum/internCertificate/getByStudentID/${studentId}`);
                const data = await response.json();
                
                if (data.isSuccess) {
                    this.certificates = data.result || [];
                } else {
                    console.warn('Failed to load certificates:', data.error);
                    this.certificates = [];
                }
            } catch (error) {
                console.error('Error loading certificates:', error);
                this.certificates = [];
            }
        }

        async loadProjects() {
            try {
                // Get projects for this student
                const studentId = this.internData.ID;
                if (!studentId) return;

                const response = await fetch(`/curriculum/internProject/getByStudentID/${studentId}`);
                const data = await response.json();
                
                if (data.isSuccess) {
                    this.projects = data.result || [];
                } else {
                    console.warn('Failed to load projects:', data.error);
                    this.projects = [];
                }
            } catch (error) {
                console.error('Error loading projects:', error);
                this.projects = [];
            }
        }

        createPageHTML() {
            return `
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
                        <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-800">Error</h3>
                                    <div class="mt-2 text-sm text-red-700">
                                        <span id="error-text"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Main Content Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <!-- Left Column: Basic Info -->
                            <div id="edit-form-container" class="hidden bg-white rounded-lg shadow">
                                <div class="p-6">
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
                            </div>

                            <!-- Right Column: Work Experience, Project, Skill, Certificate -->
                            <div class="col-span-2 grid grid-cols-2 gap-4">
                                <div id="work-experience-section" class="hidden bg-white rounded-lg shadow">
                                    <div class="p-6">
                                        <div class="flex justify-between items-center mb-4">
                                            <h2 class="text-lg font-semibold text-gray-900">Work Experiences</h2>
                                            <button id="add-work-experience-btn" class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                                                <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                                </svg>
                                                Add
                                            </button>
                                        </div>
                                        
                                        <!-- Work Experience List -->
                                        <div id="work-experience-list">
                                            <div id="work-experience-empty" class="text-center py-8 text-gray-500">
                                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h6m-6 4h6m-2 4h2"></path>
                                                </svg>
                                                <p class="text-sm">No work experiences added yet</p>
                                                <button id="add-first-experience-btn" class="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Add your first work experience
                                                </button>
                                            </div>
                                            <!-- Work experience items will be added here -->
                                        </div>
                                    </div>
                                </div>

                                <div id="project-section" class="hidden bg-white rounded-lg shadow">
                                    <div class="p-6">
                                        <div class="flex justify-between items-center mb-4">
                                            <h2 class="text-lg font-semibold text-gray-900">Projects</h2>
                                            <button id="add-project-btn" class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                                                <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                                </svg>
                                                Add
                                            </button>
                                        </div>
                                        
                                        <!-- Project List -->
                                        <div id="project-list">
                                            <div id="project-empty" class="text-center py-8 text-gray-500">
                                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h6m-6 4h6m-2 4h2"></path>
                                                </svg>
                                                <p class="text-sm">No project added yet</p>
                                                <button id="add-first-project-btn" class="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Add your first project
                                                </button>
                                            </div>
                                            <!-- Project items will be added here -->
                                        </div>
                                    </div>
                                </div>

                                <div id="skill-section" class="hidden bg-white rounded-lg shadow">
                                    <div class="p-6">
                                        <div class="flex justify-between items-center mb-4">
                                            <h2 class="text-lg font-semibold text-gray-900">Skills</h2>
                                            <button id="add-skill-btn" class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                                                <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                                </svg>
                                                Add
                                            </button>
                                        </div>
                                        
                                        <!-- Skill List -->
                                        <div id="skill-list">
                                            <div id="skill-empty" class="text-center py-8 text-gray-500">
                                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h6m-6 4h6m-2 4h2"></path>
                                                </svg>
                                                <p class="text-sm">No skills added yet</p>
                                                <button id="add-first-skill-btn" class="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Add your first skill
                                                </button>
                                            </div>
                                            <!-- Skill items will be added here -->
                                        </div>
                                    </div>
                                </div>

                                <div id="certificate-section" class="hidden bg-white rounded-lg shadow">
                                    <div class="p-6">
                                        <div class="flex justify-between items-center mb-4">
                                            <h2 class="text-lg font-semibold text-gray-900">Certificates</h2>
                                            <button id="add-certificate-btn" class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                                                <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                                </svg>
                                                Add
                                            </button>
                                        </div>
                                        
                                        <!-- Certificate List -->
                                        <div id="certificate-list">
                                            <div id="certificate-empty" class="text-center py-8 text-gray-500">
                                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h6m-6 4h6m-2 4h2"></path>
                                                </svg>
                                                <p class="text-sm">No certificates added yet</p>
                                                <button id="add-first-certificate-btn" class="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Add your first certificate
                                                </button>
                                            </div>
                                            <!-- Certificate items will be added here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Success Message -->
                        <div id="success-message" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-6">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-green-800">Success</h3>
                                    <div class="mt-2 text-sm text-green-700">
                                        <span id="success-text"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        setupEventListeners() {
            // Back to list button
            document.getElementById('back-to-list')?.addEventListener('click', () => this.goBackToList());
            
            // Cancel button
            document.getElementById('cancel-btn')?.addEventListener('click', () => this.goBackToList());
            
            // Form submission
            document.getElementById('intern-student-edit-form')?.addEventListener('submit', (e) => this.handleSubmit(e));

            // Work Experience, Project, Skill, Certificate buttons
            document.getElementById('add-work-experience-btn')?.addEventListener('click', () => this.navigateToCreateWorkExperience());
            document.getElementById('add-first-experience-btn')?.addEventListener('click', () => this.navigateToCreateWorkExperience());
            document.getElementById('add-project-btn')?.addEventListener('click', () => this.navigateToCreateProject());
            document.getElementById('add-first-project-btn')?.addEventListener('click', () => this.navigateToCreateProject());
            document.getElementById('add-skill-btn')?.addEventListener('click', () => this.navigateToCreateSkill());
            document.getElementById('add-first-skill-btn')?.addEventListener('click', () => this.navigateToCreateSkill());
            document.getElementById('add-certificate-btn')?.addEventListener('click', () => this.navigateToCreateCertificate());
            document.getElementById('add-first-certificate-btn')?.addEventListener('click', () => this.navigateToCreateCertificate());
        }

        populateForm() {
            if (!this.internData) {
                this.showError('No intern data available');
                return;
            }

            try {
                // Populate current student info from internstudent response
                if (this.internData.Student) {
                    const student = this.internData.Student;
                    document.getElementById('current-student-code').textContent = student.student_code || 'N/A';
                    document.getElementById('current-student-name').textContent = 
                        `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A';
                    document.getElementById('current-student-email').textContent = student.email || 'N/A';
                    document.getElementById('current-student-phone').textContent = student.phone || 'N/A';
                }

                // Populate other fields
                document.getElementById('intern_status').value = this.internData.intern_status || 'NOT_STARTED';
                document.getElementById('overview').value = this.internData.overview || '';

                // Show the form and work experience, project, skill, and certificate sections
                document.getElementById('loading-form')?.classList.add('hidden');
                document.getElementById('edit-form-container')?.classList.remove('hidden');
                document.getElementById('work-experience-section')?.classList.remove('hidden');
                document.getElementById('project-section')?.classList.remove('hidden');
                document.getElementById('skill-section')?.classList.remove('hidden');
                document.getElementById('certificate-section')?.classList.remove('hidden');

                // Render work experiences, skills, certificates, and projects
                this.renderWorkExperiences();
                this.renderSkills();
                this.renderCertificates();
                this.renderProjects();

            } catch (error) {
                console.error('Error populating form:', error);
                this.showError('Failed to populate form data');
            }
        }

        renderWorkExperiences() {
            const listContainer = document.getElementById('work-experience-list');
            const emptyState = document.getElementById('work-experience-empty');
            
            if (!this.workExperiences || this.workExperiences.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            // Clear existing items (except empty state)
            const existingItems = listContainer.querySelectorAll('.work-experience-item');
            existingItems.forEach(item => item.remove());
            
            // Add work experience items
            this.workExperiences.forEach(exp => {
                const expElement = this.createWorkExperienceItem(exp);
                listContainer.appendChild(expElement);
            });
        }

        createWorkExperienceItem(experience) {
            const div = document.createElement('div');
            div.className = 'work-experience-item bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3';
            
            const startDate = experience.start_date ? new Date(experience.start_date).toLocaleDateString() : 'N/A';
            const endDate = experience.end_date ? new Date(experience.end_date).toLocaleDateString() : 'Present';
            
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="mb-2">
                            <h4 class="text-sm font-semibold text-gray-900">
                                ${experience.Company?.company_name || `Company ID: ${experience.company_id}`}
                            </h4>
                            <p class="text-xs text-gray-600">${startDate} - ${endDate}</p>
                        </div>
                        <div class="text-sm text-gray-700">
                            <p class="line-clamp-2">${experience.detail || 'No details provided'}</p>
                        </div>
                    </div>
                    <div class="ml-4">
                        <button onclick="window.internStudentEdit.navigateToEditWorkExperience(${experience.ID})" 
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>
            `;
            
            return div;
        }

        renderSkills() {
            const listContainer = document.getElementById('skill-list');
            const emptyState = document.getElementById('skill-empty');
            
            if (!this.skills || this.skills.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            // Clear existing items (except empty state)
            const existingItems = listContainer.querySelectorAll('.skill-item');
            existingItems.forEach(item => item.remove());
            
            // Add skill items
            this.skills.forEach(skill => {
                const skillElement = this.createSkillItem(skill);
                listContainer.appendChild(skillElement);
            });
        }

        createSkillItem(skill) {
            const div = document.createElement('div');
            div.className = 'skill-item bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3';
            
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="mb-2">
                            <h4 class="text-sm font-semibold text-gray-900">
                                ${(skill.Skill && skill.Skill.skill_name) || 'Unnamed Skill'}
                            </h4>
                            <p class="text-xs text-gray-600">Level: ${skill.level ?? 'N/A'}</p>
                        </div>
                        <div class="text-sm text-gray-700">
                            <p class="line-clamp-2">${skill.description || 'No description provided'}</p>
                        </div>
                    </div>
                    <div class="ml-4">
                        <button onclick="window.internStudentEdit.navigateToEditSkill(${skill.ID})" 
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>
            `;
            
            return div;
        }

        renderCertificates() {
            const listContainer = document.getElementById('certificate-list');
            const emptyState = document.getElementById('certificate-empty');
            
            if (!this.certificates || this.certificates.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            // Clear existing items (except empty state)
            const existingItems = listContainer.querySelectorAll('.certificate-item');
            existingItems.forEach(item => item.remove());
            
            // Add certificate items
            this.certificates.forEach(cert => {
                const certElement = this.createCertificateItem(cert);
                listContainer.appendChild(certElement);
            });
        }

        createCertificateItem(certificate) {
            const div = document.createElement('div');
            div.className = 'certificate-item bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3';
            
            const issueDate = certificate.issue_date ? new Date(certificate.issue_date).toLocaleDateString() : 'N/A';
            const expiryDate = certificate.expiry_date ? new Date(certificate.expiry_date).toLocaleDateString() : 'No Expiry';
            
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="mb-2">
                            <h4 class="text-sm font-semibold text-gray-900">
                                ${certificate.certificate_name || 'Unnamed Certificate'}
                            </h4>
                            <p class="text-xs text-gray-600">Issued: ${issueDate} | Expires: ${expiryDate}</p>
                            <p class="text-xs text-gray-500">Issuer: ${certificate.issuing_organization || 'N/A'}</p>
                        </div>
                        <div class="text-sm text-gray-700">
                            <p class="line-clamp-2">${certificate.description || 'No description provided'}</p>
                        </div>
                    </div>
                    <div class="ml-4">
                        <button onclick="window.internStudentEdit.navigateToEditCertificate(${certificate.ID})" 
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>
            `;
            
            return div;
        }

        renderProjects() {
            const listContainer = document.getElementById('project-list');
            const emptyState = document.getElementById('project-empty');
            
            if (!this.projects || this.projects.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            // Clear existing items (except empty state)
            const existingItems = listContainer.querySelectorAll('.project-item');
            existingItems.forEach(item => item.remove());
            
            // Add project items
            this.projects.forEach(project => {
                const projectElement = this.createProjectItem(project);
                listContainer.appendChild(projectElement);
            });
        }

        createProjectItem(project) {
            const div = document.createElement('div');
            div.className = 'project-item bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3';
            
            const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A';
            const endDate = project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing';
            
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="mb-2">
                            <h4 class="text-sm font-semibold text-gray-900">
                                ${project.project_name || 'Unnamed Project'}
                            </h4>
                        </div>
                        <div class="text-sm text-gray-700">
                            <p class="line-clamp-2">${project.detail || 'No description provided'}</p>
                        </div>
                    </div>
                    <div class="ml-4">
                        <button onclick="window.internStudentEdit.navigateToEditProject(${project.ID})" 
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>
            `;
            
            return div;
        }

        async navigateToCreateWorkExperience() {
            try {
                // Load the InternWorkExperienceCreate module
                await this.application.fetchModule('/curriculum/static/js/InternWorkExperienceCreate.js');
                
                if (window.InternWorkExperienceCreate) {
                    // Pass the InternStudent ID (this.internId)
                    const createForm = new window.InternWorkExperienceCreate(this.application, this.internId);
                    await createForm.render();
                } else {
                    console.error('InternWorkExperienceCreate class not found');
                    this.showError('Failed to load work experience form');
                }
            } catch (error) {
                console.error('Error loading work experience create form:', error);
                this.showError('Failed to load work experience form: ' + error.message);
            }
        }

        async navigateToEditWorkExperience(experienceId) {
            try {
                // Load the InternWorkExperienceCreate module for editing
                await this.application.fetchModule('/curriculum/static/js/InternWorkExperienceCreate.js');
                
                if (window.InternWorkExperienceCreate) {
                    const studentId = this.internData.StudentID || this.internData.student_id;
                    // Pass the experience ID to edit mode
                    const editForm = new window.InternWorkExperienceCreate(this.application, studentId, experienceId);
                    await editForm.render();
                } else {
                    console.error('InternWorkExperienceCreate class not found');
                    this.showError('Failed to load work experience edit form');
                }
            } catch (error) {
                console.error('Error loading work experience edit form:', error);
                this.showError('Failed to load work experience edit form: ' + error.message);
            }
        }

        async navigateToCreateProject() {
            try {
                // Load the InternProjectCreate module
                await this.application.fetchModule('/curriculum/static/js/InternProjectCreate.js');

                if (window.InternProjectCreate) {
                    // Pass the InternStudent ID (this.internId)
                    const createForm = new window.InternProjectCreate(this.application, this.internId);
                    await createForm.render();
                } else {
                    console.error('InternProjectCreate class not found');
                    this.showError('Failed to load project form');
                }
            } catch (error) {
                console.error('Error loading project create form:', error);
                this.showError('Failed to load project form: ' + error.message);
            }
        }

        async navigateToEditProject(projectId) {
            try {
                // Load the InternProjectCreate module for editing
                await this.application.fetchModule('/curriculum/static/js/InternProjectCreate.js');

                if (window.InternProjectCreate) {
                    const studentId = this.internData.StudentID || this.internData.student_id;
                    // Pass the project ID and student ID to edit mode
                    const editForm = new window.InternProjectCreate(this.application, studentId, projectId);
                    await editForm.render();
                } else {
                    console.error('InternProjectCreate class not found');
                    this.showError('Failed to load project edit form');
                }
            } catch (error) {
                console.error('Error loading project edit form:', error);
                this.showError('Failed to load project edit form: ' + error.message);
            }
        }

        async navigateToCreateSkill() {
            try {
                // Load the InternSkillCreate module
                await this.application.fetchModule('/curriculum/static/js/InternStudentSkillCreate.js');

                if (window.InternStudentSkillCreate) {
                    // Pass the InternStudent ID (this.internId)
                    const createForm = new window.InternStudentSkillCreate(this.application, this.internId);
                    await createForm.render();
                } else {
                    console.error('InternStudentSkillCreate class not found');
                    this.showError('Failed to load skill form');
                }
            } catch (error) {
                console.error('Error loading skill create form:', error);
                this.showError('Failed to load skill form: ' + error.message);
            }
        }

        async navigateToEditSkill(skillId) {
            try {
                // Load the InternStudentSkillCreate module for editing
                await this.application.fetchModule('/curriculum/static/js/InternStudentSkillCreate.js');

                if (window.InternStudentSkillCreate) {
                    const studentId = this.internData.StudentID || this.internData.student_id;
                    // Pass the skill ID and student ID to edit mode
                    const editForm = new window.InternStudentSkillCreate(this.application, studentId, skillId);
                    await editForm.render();
                } else {
                    console.error('InternStudentSkillCreate class not found');
                    this.showError('Failed to load skill edit form');
                }
            } catch (error) {
                console.error('Error loading skill edit form:', error);
                this.showError('Failed to load skill edit form: ' + error.message);
            }
        }

        async navigateToCreateCertificate() {
            try {
                // Load the InternCertificateCreate module
                await this.application.fetchModule('/curriculum/static/js/InternCertificateCreate.js');

                if (window.InternCertificateCreate) {
                    // Pass the InternStudent ID (this.internId)
                    const createForm = new window.InternCertificateCreate(this.application, this.internId);
                    await createForm.render();
                } else {
                    console.error('InternCertificateCreate class not found');
                    this.showError('Failed to load certificate form');
                }
            } catch (error) {
                console.error('Error loading certificate create form:', error);
                this.showError('Failed to load certificate form: ' + error.message);
            }
        }

        async navigateToEditCertificate(certificateId) {
            try {
                // Load the InternCertificateCreate module for editing
                await this.application.fetchModule('/curriculum/static/js/InternCertificateCreate.js');

                if (window.InternCertificateCreate) {
                    const studentId = this.internData.StudentID || this.internData.student_id;
                    // Pass the certificate ID and student ID to edit mode
                    const editForm = new window.InternCertificateCreate(this.application, studentId, certificateId);
                    await editForm.render();
                } else {
                    console.error('InternCertificateCreate class not found');
                    this.showError('Failed to load certificate edit form');
                }
            } catch (error) {
                console.error('Error loading certificate edit form:', error);
                this.showError('Failed to load certificate edit form: ' + error.message);
            }
        }

        handleStudentChange(event) {
            const selectedStudentId = parseInt(event.target.value);
            const selectedStudent = this.students.find(s => s.ID === selectedStudentId);
            
            if (selectedStudent) {
                // Update current student info display
                document.getElementById('current-student-code').textContent = selectedStudent.student_code || 'N/A';
                document.getElementById('current-student-name').textContent = 
                    `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || 'N/A';
                document.getElementById('current-student-email').textContent = selectedStudent.email || 'N/A';
                document.getElementById('current-student-phone').textContent = selectedStudent.phone || 'N/A';
            }
        }

        async handleSubmit(event) {
            event.preventDefault();
            
            const updateBtn = document.getElementById('update-btn');
            const updateBtnText = document.getElementById('update-btn-text');
            const updateBtnSpinner = document.getElementById('update-btn-spinner');
            
            // Show loading state
            updateBtn.disabled = true;
            updateBtnText.textContent = 'Updating...';
            updateBtnSpinner.classList.remove('hidden');
            
            try {
                const formData = new FormData(event.target);
                const updateData = {
                    intern_status: formData.get('intern_status'),
                    overview: formData.get('overview')
                };

                // Remove empty fields
                Object.keys(updateData).forEach(key => {
                    if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
                        delete updateData[key];
                    }
                });

                const response = await fetch(`/curriculum/UpdateInternStudent/${this.internId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });

                const result = await response.json();
                
                if (result.isSuccess) {
                    this.showSuccess('Intern student updated successfully!');
                    // Optionally refresh work experiences, skills, certificates, and projects
                    await this.loadWorkExperiences();
                    await this.loadSkills();
                    await this.loadCertificates();
                    await this.loadProjects();
                    this.renderWorkExperiences();
                    this.renderSkills();
                    this.renderCertificates();
                    this.renderProjects();
                } else {
                    throw new Error(result.error || 'Failed to update intern student');
                }
                
            } catch (error) {
                console.error('Error updating intern student:', error);
                this.showError(error.message);
            } finally {
                // Reset button state
                updateBtn.disabled = false;
                updateBtnText.textContent = 'Update Intern Student';
                updateBtnSpinner.classList.add('hidden');
            }
        }

        async goBackToList() {
            try {
                // Load the list module
                await this.application.fetchModule('/curriculum/static/js/InternStudentList.js');
                
                if (window.InternStudentList) {
                    const listView = new window.InternStudentList(this.application);
                    await listView.render();
                } else {
                    console.error('InternStudentList class not found');
                }
            } catch (error) {
                console.error('Error loading list view:', error);
            }
        }

        showError(message) {
            const errorMessage = document.getElementById('error-message');
            const errorText = document.getElementById('error-text');
            
            if (errorText) errorText.textContent = message;
            if (errorMessage) errorMessage.classList.remove('hidden');
            
            // Hide loading and success
            document.getElementById('loading-form')?.classList.add('hidden');
            document.getElementById('success-message')?.classList.add('hidden');
        }

        showSuccess(message) {
            const successMessage = document.getElementById('success-message');
            const successText = document.getElementById('success-text');
            
            if (successText) successText.textContent = message;
            if (successMessage) successMessage.classList.remove('hidden');
            
            // Hide error message
            document.getElementById('error-message')?.classList.add('hidden');
        }

        async showWorkExperienceForm(experienceId = null) {
            try {
                // Load the InternWorkExperienceCreate module
                await this.application.fetchModule('/curriculum/static/js/InternWorkExperienceCreate.js');
                
                if (window.InternWorkExperienceCreate) {
                    // Pass the InternStudent ID (this.internId), not the StudentID
                    this.workExpForm = new window.InternWorkExperienceCreate(this.application, this.internId);
                    await this.workExpForm.render();
                    
                } else {
                    console.error('InternWorkExperienceCreate class not found');
                    this.showError('Failed to load work experience form');
                }
            } catch (error) {
                console.error('Error loading work experience form:', error);
                this.showError('Failed to load work experience form: ' + error.message);
            }
        }
    }
    
    // Make it globally accessible
    window.InternStudentEdit = InternStudentEdit;
}