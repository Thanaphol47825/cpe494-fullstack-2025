package migration

import "ModEd/common/model"

type CommonMigrationStrategy struct {
}

func (s *CommonMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.Department{},
		&model.Faculty{},
		&model.Instructor{},
		&model.InternationalStudent{},
		&model.RegularStudent{},
		&model.Student{},
	}
}

func (s *CommonMigrationStrategy) GetSeedPath() []interface{} {
	return nil
}
