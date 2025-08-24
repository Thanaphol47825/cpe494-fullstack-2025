package model

import (
	"ModEd/core"
	"time"

	"gorm.io/gorm"
)

type Curriculum struct {
	core.BaseModel
	CurriculumId uint   `gorm:"primaryKey;unique" csv:"curriculum_id" json:"curriculum_id"`
	Name         string `gorm:"not null" csv:"name" json:"name"`
	StartYear    int    `gorm:"not null" csv:"start_year" json:"start_year"`
	EndYear      int    `gorm:"not null" csv:"end_year" json:"end_year"`
	DepartmentId uint   `gorm:"not null" csv:"department_id" json:"department_id"`
	// Department   model.Department  `gorm:"foreignKey:ID;references:DepartmentId" csv:"-" json:"-"`
	// ProgramType  model.ProgramType `gorm:"type:text;not null" csv:"program_type" json:"program_type"`
	// CourseList []Course       `gorm:"foreignKey:CurriculumId;references:CurriculumId" csv:"-" json:"-"`
	CreatedAt time.Time      `gorm:"autoCreateTime" csv:"created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" csv:"updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `csv:"-" json:"-"`
}
