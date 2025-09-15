// MEP-1002
package model

import (
	"ModEd/core"
)

type Course struct {
	core.BaseModel
	Name         string       `gorm:"not null" csv:"name"`
	Description  string       `gorm:"not null" csv:"description"`
	CurriculumId uint         `gorm:"not null" csv:"curriculum_id"`
	Curriculum   Curriculum   `gorm:"foreignKey:CurriculumId;references:ID"`
	Optional     bool         `gorm:"not null" csv:"optional" validate:"required"`
	CourseStatus CourseStatus `gorm:"type:int;not null" csv:"course_status"`
	ClassList    []Class      `gorm:"foreignKey:CourseId;references:ID" csv:"-"`
	Prerequisite []Course     `gorm:"many2many:course_prerequisites;joinForeignKey:CourseId;joinReferences:PrerequisiteId" csv:"-"`
}

func (Course) TableName() string {
	return "courses"
}
