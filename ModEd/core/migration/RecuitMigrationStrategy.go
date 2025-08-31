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
		{Path: "data/common/DepartmentList.csv", Model: &model.Admin{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Applicant{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.ApplicationRound{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.InterviewCriteria{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Interview{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.ApplicationReport{}},
	}
}
