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
	}
}
