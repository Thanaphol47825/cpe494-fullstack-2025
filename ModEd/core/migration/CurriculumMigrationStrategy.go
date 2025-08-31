package migration

import "ModEd/curriculum/model"

type CurriculumMigrationStrategy struct {
}

func (s *CurriculumMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.Curriculum{},
		&model.Course{},
		&model.Class{},
		&model.ClassMaterial{},
		&model.CoursePlan{},
		&model.Advisor{},
		&model.Company{},
		&model.InternshipReport{},
		// &model.InternshipResultEvaluation{},
		&model.InternshipMentor{},
		&model.InternStudent{},
	}
}

func (s *CurriculumMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{
		{Path: "data/common/DepartmentList.csv", Model: &model.Curriculum{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Course{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Class{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.ClassMaterial{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.CoursePlan{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Advisor{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Company{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.InternshipReport{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.InternshipMentor{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.InternStudent{}},
	}
}
