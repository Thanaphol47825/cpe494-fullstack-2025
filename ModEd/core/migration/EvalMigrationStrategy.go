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
		&model.QuizSubmission{},
		&model.Submission{},
	}
}

// คืนค่า seed data path ของ module eval
func (s *EvalMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{}
}
