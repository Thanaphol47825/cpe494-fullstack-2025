package migration

import "ModEd/eval/model"

type EvalMigrationStrategy struct {
}

// คืนค่า slice ของ model ทั้งหมดของ module eval
func (s *EvalMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.Assignment{},
		&model.AssignmentProgress{},
		&model.AssignmentSubmission{},
		&model.Evaluation{},
		&model.Quiz{},
		&model.QuizQuestion{},
		&model.QuizSubmission{},
		&model.Submission{},
	}
}

// คืนค่า seed data path ของ module eval
func (s *EvalMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{
		{Path: "data/eval/assignment.json", Model: &[]model.Assignment{}},
		{Path: "data/eval/quiz.json", Model: &[]model.Quiz{}},
		{Path: "data/eval/submission.json", Model: &[]model.Submission{}},
	}
}
