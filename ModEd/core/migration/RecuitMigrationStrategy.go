package migration

import "ModEd/recruit/model"

type RecuitMigrationStrategy struct {
}

func (s *RecuitMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.Admin{},
		&model.Applicant{},
		&model.ApplicationRound{},
		&model.InterviewCriteria{},
		&model.Interview{},
		&model.ApplicationReport{},
	}
}

func (s *RecuitMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{}
}
