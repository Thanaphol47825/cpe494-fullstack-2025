package model

import (
	"ModEd/common/model"
	"ModEd/core"
)

type Curriculum struct {
	core.BaseModel
	Name         string            `gorm:"not null" csv:"name"`
	StartYear    int               `gorm:"not null" csv:"start_year"`
	EndYear      int               `gorm:"not null" csv:"end_year"`
	DepartmentId uint              `gorm:"not null" csv:"department_id"`
	Department   model.Department  `gorm:"foreignKey:DepartmentId;references:ID" csv:"-"`
	ProgramType  model.ProgramType `gorm:"type:int;not null" csv:"program_type"`
	CourseList   []Course          `gorm:"foreignKey:CurriculumId;references:ID"`
}

func (Curriculum) TableName() string {
	return "curriculums"
}
