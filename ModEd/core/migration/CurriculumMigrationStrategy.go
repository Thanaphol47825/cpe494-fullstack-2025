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
		&model.InternshipMentor{},
		&model.InternStudent{},
		&model.InternWorkExperience{},
		&model.InternProject{},
		&model.InternshipInformation{},
		&model.InternshipApplication{},
		&model.InternshipReport{},
		&model.InternshipResultEvaluation{},
		&model.InternshipMentor{},
		&model.InternshipAttendance{},
		&model.InternshipCriteria{},
		&model.SupervisorReview{},
	}
}

func (s *CurriculumMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{
		// {Path: "data/common/DepartmentList.csv", Model: &model.Curriculum{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.Course{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.Class{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.ClassMaterial{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.CoursePlan{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.Advisor{}},
		{Path: "data/curriculum/company.json", Model: &[]model.Company{}},
		{Path: "data/common/internshipReport.json", Model: &model.InternshipReport{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipMentor{}},
		// {Path: "data/curriculum/internStudent.json", Model: &[]model.InternStudent{}},
		{Path: "data/curriculum/internshipMentor.json", Model: &[]model.InternshipMentor{}},
		// {Path: "data/curriculum/internshipInformation.json", Model: &[]model.InternshipInformation{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipAttendance{}},
		{Path: "data/curriculum/internshipApplication.json", Model: &[]model.InternshipApplication{}},
		{Path: "data/curriculum/internshipCriteria.json", Model: &[]model.InternshipCriteria{}},
	}
}
