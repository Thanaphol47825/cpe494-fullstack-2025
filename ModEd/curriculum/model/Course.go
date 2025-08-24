// MEP-1002
package model

import (
	"ModEd/core"
)

type Course struct {
	core.BaseModel
	CourseId     uint         `gorm:"not null;uniqueIndex" csv:"course_id" json:"course_id"`
	Name         string       `gorm:"not null" csv:"name" json:"name"`
	Description  string       `gorm:"not null" csv:"description" json:"description"`
	CurriculumId uint         `gorm:"not null" csv:"curriculum_id" json:"curriculum_id"`
	Curriculum   Curriculum   `gorm:"foreignKey:CurriculumId;references:ID"`
	Optional     bool         `gorm:"not null" csv:"optional" json:"optional" validate:"required"`
	CourseStatus CourseStatus `gorm:"type:int;not null" csv:"course_status" json:"course_status"`
	// ClassList    []Class  `gorm:"foreignKey:CourseId;references:CourseId" csv:"-" json:"-"`
	// Prerequisite []Course `gorm:"many2many:course_prerequisites;foreignKey:CourseId;joinForeignKey:CourseId;References:CourseId;joinReferences:PrerequisiteId" csv:"-" json:"-"`
	*core.SerializableRecord
}

func (Course) TableName() string {
	return "courses"
}
