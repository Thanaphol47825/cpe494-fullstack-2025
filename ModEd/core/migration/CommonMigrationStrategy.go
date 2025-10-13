package migration

import "ModEd/common/model"

type CommonMigrationStrategy struct {
}

func (s *CommonMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.User{},
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
		{Path: "data/common/Users.csv", Model: &[]model.User{}},
		{Path: "data/common/DepartmentList.csv", Model: &[]model.Department{}},
		{Path: "data/common/FacultyList.csv", Model: &[]model.Faculty{}},
		{Path: "data/common/TestStudent.json", Model: &[]model.Student{}},
	}
}
