package migration

import "ModEd/curriculum/model"

type CurriculumMigrationStrategy struct {
}

func (s *CurriculumMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.Curriculum{},
		&model.Course{},
		&model.Skill{},
		&model.CourseSkill{},
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
		&model.InternshipRegistration{},
		&model.InternshipReport{},
		&model.InternshipResultEvaluation{},
		&model.InternshipMentor{},
		&model.InternshipAttendance{},
		&model.InternshipCriteria{},
		&model.InternCertificate{},
		&model.Certificate{},
		&model.InternSkill{},
		&model.InternStudentSkill{},
		&model.SupervisorReview{},
		&model.InternshipAnnouncement{},
	}
}

func (s *CurriculumMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{
		{Path: "data/curriculum/curriculum.json", Model: &[]model.Curriculum{}},
		{Path: "data/curriculum/course.json", Model: &[]model.Course{}},
		{Path: "data/curriculum/skill.json", Model: &[]model.Skill{}},
		{Path: "data/curriculum/courseSkill.json", Model: &[]model.CourseSkill{}},
		{Path: "data/curriculum/class.json", Model: &[]model.Class{}},
		{Path: "data/curriculum/classMaterial.json", Model: &[]model.ClassMaterial{}},
		{Path: "data/curriculum/coursePlan.json", Model: &[]model.CoursePlan{}},

		{Path: "data/curriculum/company.json", Model: &[]model.Company{}},
		// {Path: "data/common/internshipReport.json", Model: &model.InternshipReport{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipMentor{}},
		// {Path: "data/curriculum/internStudent.json", Model: &[]model.InternStudent{}},
		{Path: "data/curriculum/internshipMentor.json", Model: &[]model.InternshipMentor{}},
		// {Path: "data/curriculum/internshipInformation.json", Model: &[]model.InternshipInformation{}},
		// {Path: "data/common/DepartmentList.csv", Model: &model.InternshipAttendance{}},
		{Path: "data/curriculum/InternshipRegistration.json", Model: &[]model.InternshipRegistration{}},
		// {Path: "data/curriculum/internshipCriteria.json", Model: &[]model.InternshipCriteria{}},
		// {Path: "data/curriculum/internCertificate.json", Model: &[]model.InternCertificate{}},
		// {Path: "data/curriculum/certificate.json", Model: &[]model.Certificate{}},
	}
}
