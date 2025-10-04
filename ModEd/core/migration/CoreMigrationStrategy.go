package migration

import "ModEd/core/model"

type CoreMigrationStrategy struct {
}

func (s *CoreMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.UserRole{},
	}
}

func (s *CoreMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{}
}
