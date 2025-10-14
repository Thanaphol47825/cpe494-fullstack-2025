if (typeof window !== "undefined" && !window.EvalHomeTemplate) {
  class EvalHomeTemplate {
    // Template variables for Menu.tpl and MenuCard.tpl
    static BOX_COLORS = {
      "Create Assignment": "from-emerald-500 to-teal-500",
      "Manage Assignments": "from-emerald-500 to-teal-500",
      "Create Quiz": "from-orange-500 to-red-500",
      "Manage Quizzes": "from-orange-500 to-red-500",
      "Create Submission": "from-purple-500 to-indigo-500",
      "Manage Submissions": "from-purple-500 to-indigo-500",
      "Submit Quiz": "from-blue-500 to-cyan-500",
      "Manage Quiz Submissions": "from-blue-500 to-cyan-500"
    };

    static ICON_PATHS = {
      "Create Assignment": "M12 6v6m0 0v6m0-6h6m-6 0H6",
      "Manage Assignments": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      "Create Quiz": "M12 6v6m0 0v6m0-6h6m-6 0H6",
      "Manage Quizzes": "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      "Create Submission": "M12 6v6m0 0v6m0-6h6m-6 0H6",
      "Manage Submissions": "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
      "Submit Quiz": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      "Manage Quiz Submissions": "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    };

    static DESCRIPTIONS = {
      "Create Assignment": "Design, distribute, and track assignments",
      "Manage Assignments": "View, edit, and delete existing assignments",
      "Create Quiz": "Create new quizzes with questions and answers",
      "Manage Quizzes": "View, edit, and manage existing quizzes",
      "Create Submission": "Submit new assignments and projects",
      "Manage Submissions": "View, evaluate, and manage all submissions",
      "Submit Quiz": "Take and submit quiz responses",
      "Manage Quiz Submissions": "View and grade quiz submissions"
    };

    static GRADIENTS = {
      "Create Assignment": "from-emerald-500 to-teal-600",
      "Manage Assignments": "from-emerald-500 to-teal-600",
      "Create Quiz": "from-orange-500 to-red-600",
      "Manage Quizzes": "from-orange-500 to-red-600",
      "Create Submission": "from-purple-500 to-indigo-600",
      "Manage Submissions": "from-purple-500 to-indigo-600",
      "Submit Quiz": "from-blue-500 to-cyan-600",
      "Manage Quiz Submissions": "from-blue-500 to-cyan-600"
    };

    static async getTemplate(models, templateEngine) {
      try {
        // Load custom templates
        const homeTemplateResponse = await fetch(`${RootURL}/eval/static/view/EvalHomeTemplate.tpl`);
        const cardTemplateResponse = await fetch(`${RootURL}/eval/static/view/EvalCard.tpl`);
        
        if (!homeTemplateResponse.ok || !cardTemplateResponse.ok) {
          throw new Error('Failed to load custom templates');
        }
        
        const homeTemplateContent = await homeTemplateResponse.text();
        const cardTemplateContent = await cardTemplateResponse.text();

        // Define the 3 main cards with multiple buttons
        const evalCards = [
          {
            card_title: "Assignment",
            card_description: "Design, distribute, and track assignments",
            icon_path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
            icon_color: "from-emerald-500 to-teal-600",
            box_color: "emerald",
            create_button: {
              create_link: "eval/assignment/create",
              create_color: "bg-emerald-600 hover:bg-emerald-700",
              create_text: "Create Assignment"
            },
            manage_button: {
              manage_link: "eval/assignment",
              manage_text: "Manage Assignments"
            }
          },
          {
            card_title: "Quiz",
            card_description: "Quiz management with grading and feedback",
            icon_path: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            icon_color: "from-orange-500 to-red-600",
            box_color: "orange",
            create_button: {
              create_link: "eval/quiz/create",
              create_color: "bg-orange-600 hover:bg-orange-700",
              create_text: "Create Quiz"
            },
            manage_button: {
              manage_link: "eval/quiz",
              manage_text: "Manage Quizzes"
            }
          },
          {
            card_title: "Submission",
            card_description: "Submission management and evaluation",
            icon_path: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
            icon_color: "from-purple-500 to-indigo-600",
            box_color: "purple",
            create_button: {
              create_link: "eval/submission/create",
              create_color: "bg-purple-600 hover:bg-purple-700",
              create_text: "Create Submission"
            },
            manage_button: {
              manage_link: "eval/submission",
              manage_text: "Manage Submissions"
            }
          }
        ];

        // Render individual cards using custom EvalCard template
        const cardsHTML = evalCards
          .map((cardData) => Mustache.render(cardTemplateContent, cardData))
          .join("");

        // Render main template with cards
        const renderedHTML = Mustache.render(homeTemplateContent, {
          cards_html: cardsHTML,
        });

        // Create DOM element from HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = renderedHTML.trim();

        return tempDiv.firstChild;
      } catch (error) {
        console.error("Error loading eval home template:", error);

        // Fallback: create simple template
        const fallbackDiv = document.createElement("div");
        fallbackDiv.className = "p-8 bg-white rounded-lg shadow-md";
        fallbackDiv.innerHTML = `
          <h1 class="text-3xl font-bold mb-6 text-center">Evaluation</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-gray-100 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Assignment</h3>
              <div class="space-y-2">
                <button routerLink="eval/assignment/create" class="w-full bg-emerald-600 text-white py-2 px-4 rounded">Create Assignment</button>
                <button routerLink="eval/assignment" class="w-full bg-gray-600 text-white py-2 px-4 rounded">Manage Assignments</button>
              </div>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Quiz</h3>
              <div class="space-y-2">
                <button routerLink="eval/quiz/create" class="w-full bg-orange-600 text-white py-2 px-4 rounded">Create Quiz</button>
                <button routerLink="eval/quiz" class="w-full bg-gray-600 text-white py-2 px-4 rounded">Manage Quizzes</button>
              </div>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Submission</h3>
              <div class="space-y-2">
                <button routerLink="eval/submission/create" class="w-full bg-purple-600 text-white py-2 px-4 rounded">Create Submission</button>
                <button routerLink="eval/submission" class="w-full bg-gray-600 text-white py-2 px-4 rounded">Manage Submissions</button>
              </div>
            </div>
          </div>
        `;

        return fallbackDiv;
      }
    }
  }

  // Make available globally
  window.EvalHomeTemplate = EvalHomeTemplate;
}
