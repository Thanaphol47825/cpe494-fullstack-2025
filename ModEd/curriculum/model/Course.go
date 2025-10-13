// MEP-1002
package model

import (
	"ModEd/core"
)

type Course struct {
	core.BaseModel
	Name         string       `gorm:"not null" csv:"name" json:"Name" form:"label:Name;placeholder:Enter Course Name;type:text;required:true"`
	Description  string       `gorm:"not null" csv:"description" json:"Description" form:"label:Description;placeholder:Enter Description;type:textarea;required:true"`
	CurriculumId uint         `gorm:"not null" csv:"curriculum_id" json:"CurriculumId" form:"label:Curriculum;type:select;required:true;fk:Curriculum;fklabel:name"`
	Curriculum   Curriculum   `gorm:"foreignKey:CurriculumId;references:ID" json:"Curriculum" form:"-"`
	Optional     bool         `gorm:"not null" csv:"optional" validate:"required" json:"Optional" form:"label:Optional;type:checkbox"`
	CourseStatus CourseStatus `gorm:"type:int;not null" csv:"course_status" json:"CourseStatus" form:"label:Status;type:select;required:true;apiurl:/curriculum/Course/getCourseStatusOptions"`
	ClassList    []Class      `gorm:"foreignKey:CourseId;references:ID" csv:"-" json:"ClassList" form:"-"`
	Prerequisite []Course     `gorm:"many2many:course_prerequisites;joinForeignKey:CourseId;joinReferences:PrerequisiteId" csv:"-" json:"Prerequisite" form:"-"`
}

func (Course) TableName() string {
	return "courses"
}
