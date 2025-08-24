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
	}
}

func (s *CurriculumMigrationStrategy) GetSeedPath() []interface{} {
	return nil
}
