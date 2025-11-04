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
            this.template = {
                Main: null,
                InfoCard: null,
                StatusMessage: null
            };
        }

        async loadTemplate() {
            const templates = {
                Main: "/curriculum/static/view/InternStudentEditTemplate.tpl",
                InfoCard: "/curriculum/static/view/InfoCardTemplate.tpl",
                StatusMessage: "/curriculum/static/view/StatusMessageTemplate.tpl"
            };

            try {
                await Promise.all(
                    Object.entries(templates).map(async ([key, path]) => {
                        const response = await fetch(path);
                        if (!response.ok) throw new Error(`Failed to load ${key}: ${response.statusText}`);
                        this.template[key] = await response.text();
                    })
                );
            } catch (error) {
                console.error("Error loading templates:", error);
                throw error;
            }
        }

        async render() {
            console.log("Rendering Intern Student Edit Form for ID:", this.internId);

            // Set global instance for onclick handlers
            window.internStudentEdit = this;

            // Clear the container
            this.application.mainContainer.innerHTML = '';

            // Load templates
            await this.loadTemplate();

            // Load existing intern data and work experiences
            await this.loadData();

            // Prepare sections data
            const sections = [
                { id: 'work-experience', title: 'Work Experiences', emptyMessage: 'work experiences', singularName: 'work experience' },
                { id: 'project', title: 'Projects', emptyMessage: 'projects', singularName: 'project' },
                { id: 'skill', title: 'Skills', emptyMessage: 'skills', singularName: 'skill' },
                { id: 'certificate', title: 'Certificates', emptyMessage: 'certificates', singularName: 'certificate' }
            ];

            // Render all sections HTML
            const sectionsHTML = sections.map(section => this.renderSection(section)).join('');

            // Create the main page layout with sections
            const pageHTML = Mustache.render(this.template.Main, { sectionsHTML });
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

        async loadRelatedData(type, endpoint) {
            try {
                const studentId = this.internData.ID;
                if (!studentId) return;

                const response = await fetch(`/curriculum/${endpoint}/getByStudentID/${studentId}`);
                const data = await response.json();

                this[type] = data.isSuccess ? (data.result || []) : [];
                if (!data.isSuccess) console.warn(`Failed to load ${type}:`, data.error);
            } catch (error) {
                console.error(`Error loading ${type}:`, error);
                this[type] = [];
            }
        }

        async loadWorkExperiences() {
            await this.loadRelatedData('workExperiences', 'internWorkExperience');
        }

        async loadSkills() {
            await this.loadRelatedData('skills', 'internSkill');
        }

        async loadCertificates() {
            await this.loadRelatedData('certificates', 'internCertificate');
        }

        async loadProjects() {
            await this.loadRelatedData('projects', 'internProject');
        }

        renderSection({ id, title, emptyMessage, singularName }) {
            if (!this.template.InfoCard) {
                console.error('Section template not loaded');
                return '';
            }

            return Mustache.render(this.template.InfoCard, {
                sectionId: id,
                sectionTitle: title,
                emptyMessage: emptyMessage,
                singularName: singularName
            });
        }

        renderStatusMessage(isSuccess, isError) {
            if (!this.template.StatusMessage) {
                console.error('Status message template not loaded');
                return '';
            }

            return Mustache.render(this.template.StatusMessage, {
                isError: isError,
                isSuccess: isSuccess
            });
        }

        setupEventListeners() {
            const listeners = {
                'back-to-list': () => this.goBackToList(),
                'cancel-btn': () => this.goBackToList(),
                'intern-student-edit-form': (e) => this.handleSubmit(e),
                'add-work-experience-btn': () => this.navigateToCreateWorkExperience(),
                'add-first-experience-btn': () => this.navigateToCreateWorkExperience(),
                'add-project-btn': () => this.navigateToCreateProject(),
                'add-first-project-btn': () => this.navigateToCreateProject(),
                'add-skill-btn': () => this.navigateToCreateSkill(),
                'add-first-skill-btn': () => this.navigateToCreateSkill(),
                'add-certificate-btn': () => this.navigateToCreateCertificate(),
                'add-first-certificate-btn': () => this.navigateToCreateCertificate()
            };

            Object.entries(listeners).forEach(([id, handler]) => {
                const element = document.getElementById(id);
                const event = id === 'intern-student-edit-form' ? 'submit' : 'click';
                element?.addEventListener(event, handler);
            });
        }

        populateForm() {
            if (!this.internData) return this.showError('No intern data available');

            try {
                // Populate student info
                if (this.internData.Student) {
                    const student = this.internData.Student;
                    const studentInfo = {
                        'current-student-code': student.student_code || 'N/A',
                        'current-student-name': `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
                        'current-student-email': student.email || 'N/A',
                        'current-student-phone': student.phone || 'N/A'
                    };
                    Object.entries(studentInfo).forEach(([id, value]) => {
                        const el = document.getElementById(id);
                        if (el) el.textContent = value;
                    });
                }

                // Populate form fields
                document.getElementById('intern_status').value = this.internData.intern_status || 'NOT_STARTED';
                document.getElementById('overview').value = this.internData.overview || '';

                // Toggle visibility
                ['loading-form'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
                ['edit-form-container', 'work-experience-section', 'project-section', 'skill-section', 'certificate-section']
                    .forEach(id => document.getElementById(id)?.classList.remove('hidden'));

                // Render all lists
                ['WorkExperiences', 'Skills', 'Certificates', 'Projects'].forEach(type => this[`render${type}`]());
            } catch (error) {
                console.error('Error populating form:', error);
                this.showError('Failed to populate form data');
            }
        }

        // Generic render function for lists
        renderList(type) {
            const listContainer = document.getElementById(`${type}-list`);
            const emptyState = document.getElementById(`${type}-empty`);
            const items = this[`${type}s`] || [];

            if (!items || items.length === 0) {
                emptyState?.classList.remove('hidden');
                return;
            }

            emptyState?.classList.add('hidden');

            // Clear existing items (except empty state)
            const existingItems = listContainer.querySelectorAll(`.${type}-item`);
            existingItems.forEach(item => item.remove());

            // Add items using corresponding creator function
            const creatorFn = this[`create${this.capitalize(type)}Item`];
            if (creatorFn) {
                items.forEach(item => {
                    const element = creatorFn.call(this, item);
                    listContainer.appendChild(element);
                });
            }
        }

        // Helper to capitalize first letter
        capitalize(str) {
            const map = {
                'work-experience': 'WorkExperience',
                'skill': 'Skill',
                'certificate': 'Certificate',
                'project': 'Project'
            };
            return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
        }

        renderWorkExperiences() {
            this.renderList('work-experience');
        }

        renderSkills() {
            this.renderList('skill');
        }

        renderCertificates() {
            this.renderList('certificate');
        }

        renderProjects() {
            this.renderList('project');
        }

        // Generic item creator
        createItemCard(config) {
            const div = document.createElement('div');
            div.className = `${config.type}-item bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3`;

            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="mb-2">
                            <h4 class="text-sm font-semibold text-gray-900">
                                ${config.title}
                            </h4>
                            ${config.subtitle ? `<p class="text-xs text-gray-600">${config.subtitle}</p>` : ''}
                            ${config.meta ? `<p class="text-xs text-gray-500">${config.meta}</p>` : ''}
                        </div>
                        <div class="text-sm text-gray-700">
                            <p class="line-clamp-2">${config.description || 'No description provided'}</p>
                        </div>
                    </div>
                    <div class="ml-4">
                        <button onclick="window.internStudentEdit.navigateTo${config.editHandler}(${config.id})" 
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>
            `;

            return div;
        }

        createWorkExperienceItem(experience) {
            const startDate = experience.start_date ? new Date(experience.start_date).toLocaleDateString() : 'N/A';
            const endDate = experience.end_date ? new Date(experience.end_date).toLocaleDateString() : 'Present';

            return this.createItemCard({
                type: 'work-experience',
                id: experience.ID,
                title: experience.Company?.company_name || `Company ID: ${experience.company_id}`,
                subtitle: `${startDate} - ${endDate}`,
                description: experience.detail,
                editHandler: 'EditWorkExperience'
            });
        }

        createSkillItem(skill) {
            return this.createItemCard({
                type: 'skill',
                id: skill.ID,
                title: (skill.Skill && skill.Skill.skill_name) || 'Unnamed Skill',
                subtitle: `Level: ${skill.level ?? 'N/A'}`,
                description: skill.description,
                editHandler: 'EditSkill'
            });
        }

        createCertificateItem(certificate) {
            const issueDate = certificate.issue_date ? new Date(certificate.issue_date).toLocaleDateString() : 'N/A';
            const expiryDate = certificate.expiry_date ? new Date(certificate.expiry_date).toLocaleDateString() : 'No Expiry';

            return this.createItemCard({
                type: 'certificate',
                id: certificate.ID,
                title: certificate.certificate_name || 'Unnamed Certificate',
                subtitle: `Issued: ${issueDate} | Expires: ${expiryDate}`,
                meta: `Issuer: ${certificate.issuing_organization || 'N/A'}`,
                description: certificate.description,
                editHandler: 'EditCertificate'
            });
        }

        createProjectItem(project) {
            const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A';
            const endDate = project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing';

            return this.createItemCard({
                type: 'project',
                id: project.ID,
                title: project.project_name || 'Unnamed Project',
                subtitle: `${startDate} - ${endDate}`,
                description: project.project_detail,
                editHandler: 'EditProject'
            });
        }

        // Generic navigation function
        async navigateToForm(config) {
            try {
                await this.application.fetchModule(config.modulePath);

                const FormClass = window[config.className];
                if (!FormClass) {
                    console.error(`${config.className} class not found`);
                    this.showError(`Failed to load ${config.formType} form`);
                    return;
                }

                // Determine the ID to pass (for create or edit)
                const id = config.isEdit
                    ? (this.internData.StudentID || this.internData.student_id)
                    : this.internId;

                const formInstance = config.isEdit
                    ? new FormClass(this.application, id, config.itemId)
                    : new FormClass(this.application, id);

                await formInstance.render();
            } catch (error) {
                console.error(`Error loading ${config.formType} form:`, error);
                this.showError(`Failed to load ${config.formType} form: ${error.message}`);
            }
        }

        async navigateToCreateWorkExperience() {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternWorkExperienceCreate.js',
                className: 'InternWorkExperienceCreate',
                formType: 'work experience',
                isEdit: false
            });
        }

        async navigateToEditWorkExperience(experienceId) {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternWorkExperienceCreate.js',
                className: 'InternWorkExperienceCreate',
                formType: 'work experience',
                isEdit: true,
                itemId: experienceId
            });
        }

        async navigateToCreateProject() {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternProjectCreate.js',
                className: 'InternProjectCreate',
                formType: 'project',
                isEdit: false
            });
        }

        async navigateToEditProject(projectId) {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternProjectCreate.js',
                className: 'InternProjectCreate',
                formType: 'project',
                isEdit: true,
                itemId: projectId
            });
        }

        async navigateToCreateSkill() {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternStudentSkillCreate.js',
                className: 'InternStudentSkillCreate',
                formType: 'skill',
                isEdit: false
            });
        }

        async navigateToEditSkill(skillId) {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternStudentSkillCreate.js',
                className: 'InternStudentSkillCreate',
                formType: 'skill',
                isEdit: true,
                itemId: skillId
            });
        }

        async navigateToCreateCertificate() {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternStudentCertificateCreate.js',
                className: 'InternStudentCertificateCreate',
                formType: 'certificate',
                isEdit: false
            });
        }

        async navigateToEditCertificate(certificateId) {
            await this.navigateToForm({
                modulePath: '/curriculum/static/js/InternStudentCertificateCreate.js',
                className: 'InternStudentCertificateCreate',
                formType: 'certificate',
                isEdit: true,
                itemId: certificateId
            });
        }

        handleStudentChange(event) {
            const selectedStudent = this.students.find(s => s.ID === parseInt(event.target.value));
            if (!selectedStudent) return;

            const studentInfo = {
                'current-student-code': selectedStudent.student_code || 'N/A',
                'current-student-name': `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || 'N/A',
                'current-student-email': selectedStudent.email || 'N/A',
                'current-student-phone': selectedStudent.phone || 'N/A'
            };
            Object.entries(studentInfo).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            });
        }

        async handleSubmit(event) {
            event.preventDefault();

            const updateBtn = document.getElementById('update-btn');
            const updateBtnText = document.getElementById('update-btn-text');
            const updateBtnSpinner = document.getElementById('update-btn-spinner');

            this.toggleButtonState(updateBtn, updateBtnText, updateBtnSpinner, true);

            try {
                const formData = new FormData(event.target);
                const updateData = Object.fromEntries(
                    [...formData.entries()].filter(([_, value]) => value !== '' && value !== null)
                );

                const response = await fetch(`/curriculum/UpdateInternStudent/${this.internId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });

                const result = await response.json();

                if (result.isSuccess) {
                    this.showSuccess('Intern student updated successfully!');
                    await Promise.all([
                        this.loadWorkExperiences(),
                        this.loadSkills(),
                        this.loadCertificates(),
                        this.loadProjects()
                    ]);
                    ['WorkExperiences', 'Skills', 'Certificates', 'Projects'].forEach(type => this[`render${type}`]());
                } else {
                    throw new Error(result.error || 'Failed to update intern student');
                }
            } catch (error) {
                console.error('Error updating intern student:', error);
                this.showError(error.message);
            } finally {
                this.toggleButtonState(updateBtn, updateBtnText, updateBtnSpinner, false);
            }
        }

        toggleButtonState(btn, text, spinner, isLoading) {
            btn.disabled = isLoading;
            text.textContent = isLoading ? 'Updating...' : 'Update Intern Student';
            spinner.classList.toggle('hidden', !isLoading);
        }

        async goBackToList() {
            if (this.application.navigate) {
                this.application.navigate("/internship/internstudent");
            } else {
                window.location.hash = "#internship/internstudent";
            }
        }

        showMessage(message, isSuccess) {
            const statusContainer = document.getElementById('status-container');
            if (statusContainer) {
                statusContainer.innerHTML = this.renderStatusMessage(isSuccess, !isSuccess);
            }

            const messageType = isSuccess ? 'success' : 'error';
            const messageEl = document.getElementById(`${messageType}-message`);
            const textEl = document.getElementById(`${messageType}-text`);

            if (textEl) textEl.textContent = message;
            if (messageEl) messageEl.classList.remove('hidden');

            // Hide other elements
            const hideIds = isSuccess
                ? ['loading-form', 'error-message']
                : ['loading-form', 'success-message'];
            hideIds.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        }

        showError(message) {
            this.showMessage(message, false);
        }

        showSuccess(message) {
            this.showMessage(message, true);
        }

        async showWorkExperienceForm(experienceId = null) {
            try {
                await this.application.fetchModule('/curriculum/static/js/InternWorkExperienceCreate.js');
                if (!window.InternWorkExperienceCreate) throw new Error('InternWorkExperienceCreate class not found');
                this.workExpForm = new window.InternWorkExperienceCreate(this.application, this.internId);
                await this.workExpForm.render();
            } catch (error) {
                console.error('Error loading work experience form:', error);
                this.showError('Failed to load work experience form: ' + error.message);
            }
        }
    }

    // Make it globally accessible
    window.InternStudentEdit = InternStudentEdit;
}