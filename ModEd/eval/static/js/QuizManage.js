// QuizManage - Using AdvanceTableRender from core
class QuizManage {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.table = null;
    this.editForm = null;
    this.isEditMode = false;
    this.questions = [];
    this.questionCounter = 0;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Setup table with EvalTableRenderer
    this.table = new EvalTableRenderer(this.application.templateEngine, {
      modelPath: "eval/quiz",
      data: [],
      targetSelector: "#quiz-table-container",
      customColumns: [
        {
          name: "active",
          label: "Active",
          template: `<span class="px-2 py-1 rounded text-sm font-medium {activeClass}">{activeText}</span>`
        },
        {
          name: "actions",
          label: "Actions",
          template: `
            <div style="white-space:nowrap;">
              <button onclick="quizManager.editQuiz({ID})" class="text-blue-600 hover:underline mr-4">
                Edit
              </button>
              <button onclick="quizManager.deleteQuiz({ID})" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          `
        }
      ]
    });

    // Expose globally for template onclick handlers
    window.quizManager = this;

    try {
      await this.table.loadSchema();
      await this.renderManagePage();
      await this.loadQuizzes();
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load quizzes: ' + error.message);
    }
  }

  async renderManagePage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    // Load templates for manage page
    const manageTemplateResponse = await fetch(`${RootURL}/eval/static/view/QuizManage.tpl`);
    if (!manageTemplateResponse.ok) {
      // Fallback: use core templates or create basic structure
      container.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
          <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Manage Quizzes</h1>
              <p class="text-lg text-gray-600">View, edit, and delete quizzes</p>
            </div>
            <div class="mb-6">
              <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </a>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div id="quiz-table-container"></div>
            </div>
            <div id="edit-form-container" class="hidden mt-6"></div>
          </div>
        </div>
      `;
      this.table.targetSelector = "#quiz-table-container";
      await this.table.render();
    } else {
      const manageTemplateContent = await manageTemplateResponse.text();
      const manageElement = new DOMObject(manageTemplateContent, {}, false);
      container.appendChild(manageElement.html);
      this.table.targetSelector = "#quiz-table-container";
      await this.table.render();
    }
  }

  async loadQuizzes() {
    try {
      const response = await this.apiService.getAllQuizzes();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        // Transform data to include Active as computed field
        const quizzes = response.result.map(q => {
          const active = q.active !== undefined ? q.active : this.computeActive(q.startDate, q.dueDate);
          return {
            ...q,
            ID: q.ID || q.id || q.Id,
            active: active,
            activeClass: active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
            activeText: active ? 'Yes' : 'No'
          };
        });
        
        this.table.setData(quizzes);
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      this.showError('Error loading quizzes: ' + error.message);
    }
  }

  computeActive(startDate, dueDate) {
    if (!startDate || !dueDate) return false;
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(dueDate);
    return now >= start && now <= end;
  }

  async editQuiz(id) {
    try {
      // Get quiz data with questions
      const response = await this.apiService.getQuizById(id);
      
      if (!response || !response.isSuccess) {
        throw new Error('Failed to load quiz data');
      }

      const quiz = response.result;
      
      // Hide table, show edit form
      this.isEditMode = true;
      const container = document.getElementById('MainContainer');
      const tableContainer = container.querySelector('#quiz-table-container');
      const editContainer = container.querySelector('#edit-form-container');
      
      if (!editContainer) {
        // Create edit container if it doesn't exist
        const newEditContainer = document.createElement('div');
        newEditContainer.id = 'edit-form-container';
        newEditContainer.className = 'mt-6';
        container.appendChild(newEditContainer);
        this.renderEditForm(quiz, newEditContainer);
      } else {
        editContainer.classList.remove('hidden');
        this.renderEditForm(quiz, editContainer);
      }

      if (tableContainer) {
        tableContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading quiz for edit:', error);
      this.showError('Failed to load quiz: ' + error.message);
    }
  }

  async renderEditForm(quiz, container) {
    container.innerHTML = '';

    // Reset questions
    this.questions = [];
    this.questionCounter = 0;

    // Load existing questions
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach(q => {
        this.questions.push({
          id: this.questionCounter++,
          question: q.question || '',
          answer: q.answer || ''
        });
      });
    }

    // If no questions, add one empty question
    if (this.questions.length === 0) {
      this.addQuestion();
    }

    // Create form using EvalFormRenderer
    this.editForm = new EvalFormRenderer(this.application.templateEngine, {
      modelPath: "eval/quiz",
      targetSelector: "#edit-form-container",
      submitHandler: async (formData) => await this.handleUpdate(formData, quiz.ID),
      autoFocus: true,
      validateOnBlur: true
    });

    try {
      await this.editForm.render();
      
      // Pre-fill form with quiz data
      const form = container.querySelector('form');
      if (form) {
        // Set form values
        if (quiz.title) {
          const titleInput = form.querySelector('input[name="title"], input[name="Title"]');
          if (titleInput) titleInput.value = quiz.title;
        }
        if (quiz.description) {
          const descInput = form.querySelector('textarea[name="description"], textarea[name="Description"]');
          if (descInput) descInput.value = quiz.description;
        }
        if (quiz.startDate) {
          const startInput = form.querySelector('input[name="startDate"], input[name="StartDate"]');
          if (startInput) {
            const startDate = new Date(quiz.startDate);
            startInput.value = startDate.toISOString().slice(0, 16);
          }
        }
        if (quiz.dueDate) {
          const dueInput = form.querySelector('input[name="dueDate"], input[name="DueDate"]');
          if (dueInput) {
            const dueDate = new Date(quiz.dueDate);
            dueInput.value = dueDate.toISOString().slice(0, 16);
          }
        }
        if (quiz.timeLimit !== undefined) {
          const timeLimitInput = form.querySelector('input[name="timeLimit"], input[name="TimeLimit"]');
          if (timeLimitInput) timeLimitInput.value = quiz.timeLimit;
        }
        if (quiz.maxScore !== undefined) {
          const scoreInput = form.querySelector('input[name="maxScore"], input[name="MaxScore"]');
          if (scoreInput) scoreInput.value = quiz.maxScore;
        }

        // Add questions section
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        
        const questionsContainer = document.createElement('div');
        questionsContainer.id = 'questions-container';
        questionsContainer.className = 'mt-6 space-y-4';
        questionsContainer.innerHTML = '<h3 class="text-xl font-semibold mb-4">Questions</h3>';
        
        const questionsList = document.createElement('div');
        questionsList.id = 'questions-list';
        questionsList.className = 'space-y-6';
        questionsContainer.appendChild(questionsList);
        
        const addQuestionBtn = document.createElement('button');
        addQuestionBtn.type = 'button';
        addQuestionBtn.className = 'mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700';
        addQuestionBtn.textContent = '+ Add Question';
        addQuestionBtn.onclick = () => this.addQuestion();
        questionsContainer.appendChild(addQuestionBtn);
        
        if (submitBtn) {
          submitBtn.parentNode.insertBefore(questionsContainer, submitBtn);
        } else {
          form.appendChild(questionsContainer);
        }

        // Render existing questions
        this.renderAllQuestions();

        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => this.cancelEdit();
        
        if (submitBtn) {
          submitBtn.parentNode.insertBefore(cancelBtn, submitBtn);
        }
      }
    } catch (error) {
      console.error('Error rendering edit form:', error);
      this.showError('Failed to load edit form: ' + error.message);
    }
  }

  addQuestion() {
    const question = {
      id: this.questionCounter++,
      question: '',
      answer: ''
    };
    this.questions.push(question);
    this.renderQuestion(question, this.questions.length - 1);
  }

  removeQuestion(index) {
    this.questions.splice(index, 1);
    this.renderAllQuestions();
  }

  renderAllQuestions() {
    const questionsList = document.getElementById('questions-list');
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    this.questions.forEach((q, index) => {
      this.renderQuestion(q, index);
    });
  }

  renderQuestion(question, index) {
    const questionsList = document.getElementById('questions-list');
    if (!questionsList) return;

    const questionCard = document.createElement('div');
    questionCard.className = 'border border-gray-300 rounded-lg p-4 bg-gray-50';
    questionCard.id = `question-${question.id}`;
    
    questionCard.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-lg font-semibold">Question ${index + 1}</h4>
        ${this.questions.length > 1 ? `<button type="button" onclick="quizManager.removeQuestion(${index})" class="text-red-600 hover:text-red-800">Remove</button>` : ''}
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <textarea 
            name="question_${question.id}" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="3"
            placeholder="Enter your question here..."
            onchange="quizManager.updateQuestion(${index}, 'question', this.value)"
          >${question.question || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Answer</label>
          <textarea 
            name="answer_${question.id}" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="2"
            placeholder="Enter the correct answer..."
            onchange="quizManager.updateQuestion(${index}, 'answer', this.value)"
          >${question.answer || ''}</textarea>
        </div>
      </div>
    `;

    const existingCard = document.getElementById(`question-${question.id}`);
    if (existingCard) {
      existingCard.replaceWith(questionCard);
    } else {
      questionsList.appendChild(questionCard);
    }
  }

  updateQuestion(index, field, value) {
    if (this.questions[index]) {
      this.questions[index][field] = value;
    }
  }

  async handleUpdate(formData, quizId) {
    try {
      // Validate questions
      if (this.questions.length === 0) {
        this.showError('Please add at least one question');
        throw new Error('No questions provided');
      }

      for (let i = 0; i < this.questions.length; i++) {
        const q = this.questions[i];
        if (!q.question || !q.question.trim()) {
          this.showError(`Question ${i + 1} is required`);
          throw new Error(`Question ${i + 1} is required`);
        }
        if (!q.answer || !q.answer.trim()) {
          this.showError(`Answer for question ${i + 1} is required`);
          throw new Error(`Answer for question ${i + 1} is required`);
        }
      }

      // Convert dates
      if (formData.startDate) {
        formData.startDate = this.apiService.formatToRFC3339(new Date(formData.startDate));
      }
      if (formData.dueDate) {
        formData.dueDate = this.apiService.formatToRFC3339(new Date(formData.dueDate));
      }

      // Ensure numeric fields
      if (formData.timeLimit) formData.timeLimit = Number(formData.timeLimit);
      if (formData.maxScore) formData.maxScore = Number(formData.maxScore);

      // Prepare quiz data
      const quizData = {
        ID: quizId,
        title: formData.title,
        description: formData.description || '',
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        timeLimit: formData.timeLimit,
        maxScore: formData.maxScore
      };

      // Prepare questions
      const questionsData = this.questions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      }));

      const result = await this.apiService.updateQuiz({
        quiz: quizData,
        questions: questionsData
      });
      
      if (result && result.isSuccess) {
        this.showSuccess('Quiz updated successfully!');
        this.cancelEdit();
        await this.loadQuizzes();
      } else {
        throw new Error(result?.result || 'Failed to update quiz');
      }
    } catch (error) {
      console.error('Update error:', error);
      this.showError('Failed to update quiz: ' + error.message);
      throw error;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    const container = document.getElementById('MainContainer');
    const tableContainer = container.querySelector('#quiz-table-container');
    const editContainer = container.querySelector('#edit-form-container');
    
    if (tableContainer) {
      tableContainer.style.display = '';
    }
    if (editContainer) {
      editContainer.classList.add('hidden');
      editContainer.innerHTML = '';
    }
    this.questions = [];
    this.questionCounter = 0;
  }

  async deleteQuiz(id) {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const result = await this.apiService.deleteQuiz(id);
      
      if (result && result.isSuccess) {
        this.showSuccess('Quiz deleted successfully!');
        await this.loadQuizzes();
      } else {
        throw new Error(result?.message || 'Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      this.showError('Failed to delete quiz: ' + error.message);
    }
  }

  showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-green-100 text-green-800 border border-green-200';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  showError(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-red-100 text-red-800 border border-red-200';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  showInfo(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-blue-100 text-blue-800 border border-blue-200';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
}

// Expose globally
window.QuizManage = QuizManage;
