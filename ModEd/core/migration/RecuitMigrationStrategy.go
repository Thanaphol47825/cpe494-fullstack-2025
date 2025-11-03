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
	return []SeedPath{
		{Path: "data/recruit/Admin.csv", Model: &[]model.Admin{}},
		{Path: "data/recruit/Applicant.csv", Model: &[]model.Applicant{}},
		{Path: "data/recruit/ApplicationRound.csv", Model: &[]model.ApplicationRound{}},
		{Path: "data/recruit/InterviewCriteria.csv", Model: &[]model.InterviewCriteria{}},
		{Path: "data/recruit/ApplicationReport.csv", Model: &[]model.ApplicationReport{}},
		//{Path: "data/recruit/Interview.csv", Model: &[]model.Interview{}},
	}
}
