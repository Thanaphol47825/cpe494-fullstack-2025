package eval

import (
	"ModEd/core"
	"ModEd/eval/controller"
	"ModEd/eval/model"
)

func InitialEval() {
	application := core.GetApplication()

	// Auto-migrate eval models to add new columns to existing tables
	// This ensures that when we add new fields (like course_id), they get added automatically
	evalModels := []interface{}{
		&model.Assignment{},
		&model.AssignmentProgress{},
		&model.AssignmentSubmission{},
		&model.Evaluation{},
		&model.Quiz{},
		&model.QuizQuestion{},
		&model.QuizSubmission{},
		&model.Submission{},
	}

	// Always run AutoMigrate first
	application.DB.AutoMigrate(evalModels...)

	// Manually add missing columns for existing tables (handles NOT NULL columns with existing data)
	// Check if course_id exists in assignments, if not add it
	var count int
	if err := application.DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'course_id'").Scan(&count).Error; err == nil && count == 0 {
		// Add column as nullable first
		if err := application.DB.Exec("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS course_id INTEGER").Error; err == nil {
			// Set default and update existing rows
			application.DB.Exec("ALTER TABLE assignments ALTER COLUMN course_id SET DEFAULT 1")
			application.DB.Exec("UPDATE assignments SET course_id = 1 WHERE course_id IS NULL")
			// Now make it NOT NULL
			application.DB.Exec("ALTER TABLE assignments ALTER COLUMN course_id SET NOT NULL")
		}
	}

	// Same for quizzes
	if err := application.DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'course_id'").Scan(&count).Error; err == nil && count == 0 {
		if err := application.DB.Exec("ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS course_id INTEGER").Error; err == nil {
			application.DB.Exec("ALTER TABLE quizzes ALTER COLUMN course_id SET DEFAULT 1")
			application.DB.Exec("UPDATE quizzes SET course_id = 1 WHERE course_id IS NULL")
			application.DB.Exec("ALTER TABLE quizzes ALTER COLUMN course_id SET NOT NULL")
		}
	}

	// Check for quiz_submissions columns
	if err := application.DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'quiz_submissions' AND column_name = 'quiz_id'").Scan(&count).Error; err == nil && count == 0 {
		if err := application.DB.Exec("ALTER TABLE quiz_submissions ADD COLUMN IF NOT EXISTS quiz_id INTEGER").Error; err == nil {
			application.DB.Exec("ALTER TABLE quiz_submissions ALTER COLUMN quiz_id SET DEFAULT 1")
			application.DB.Exec("UPDATE quiz_submissions SET quiz_id = 1 WHERE quiz_id IS NULL")
			application.DB.Exec("ALTER TABLE quiz_submissions ALTER COLUMN quiz_id SET NOT NULL")
		}
	}

	if err := application.DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'quiz_submissions' AND column_name = 'user_id'").Scan(&count).Error; err == nil && count == 0 {
		application.DB.Exec("ALTER TABLE quiz_submissions ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)")
	}

	application.AddController(controller.NewAssignmentController())
	application.AddController(controller.NewAssignmentSubmissionController())
	application.AddController(controller.NewAssignmentProgressController())
	application.AddController(controller.NewQuizController())
	application.AddController(controller.NewQuizSubmissionController())
	application.AddController(controller.NewEvaluationController())
	application.AddController(controller.NewSubmissionController())
}
