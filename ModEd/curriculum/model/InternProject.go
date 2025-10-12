package model

import (
	"ModEd/core"
)

type InternProject struct {
	core.BaseModel
	StudentId     uint          `gorm:"not null; uniqueIndex:idx_student_project" json:"student_id"`
	Student       InternStudent `gorm:"foreignKey:StudentId;references:ID"`
	ProjectName   string        `gorm:"type:varchar(255); uniqueIndex:idx_project_name" json:"project_name" csv:"project_name"`
	ProjectDetail string        `gorm:"type:text" json:"project_detail" csv:"project_detail"`
}
