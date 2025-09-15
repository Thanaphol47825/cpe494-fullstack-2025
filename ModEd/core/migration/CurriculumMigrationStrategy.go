package migration

import "ModEd/curriculum/model"

type CurriculumMigrationStrategy struct {
}

func (s *CurriculumMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		// &model.Curriculum{},
		// &model.Course{},
		// &model.Class{},
		// &model.ClassMaterial{},
		// &model.CoursePlan{},
		// &model.Advisor{},
		&model.Company{},
		// &model.InternshipReport{},
		// &model.InternshipResultEvaluation{},
		// &model.InternshipMentor{},
		&model.InternStudent{},
		// &model.InternshipAttendance{},
		// &model.InternshipCriteria{},
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
<<<<<<< HEAD
		{Path: "data/curriculum/company.json", Model: &[]model.Company{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipReport{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipMentor{}},
		{Path: "data/curriculum/internStudent.json", Model: &[]model.InternStudent{}},
		{Path: "data/curriculum/internshipMentor.json", Model: &[]model.InternshipMentor{}},
=======
		{Path: "data/curriculum/Company.csv", Model: &[]model.Company{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipReport{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipMentor{}},
		{Path: "data/curriculum/InternStudent.json", Model: &[]model.InternStudent{}},
>>>>>>> f38feb4fcd132231a98f58e2950a3eaa5fc13a7d
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipAttendance{}},
	}
}
