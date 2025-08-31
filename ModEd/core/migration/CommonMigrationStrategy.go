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

func (s *CommonMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{
		{Path: "data/common/DepartmentList.csv", Model: &model.Department{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Faculty{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.InternationalStudent{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Instructor{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.RegularStudent{}},
		{Path: "data/common/DepartmentList.csv", Model: &model.Student{}},
	}
}
