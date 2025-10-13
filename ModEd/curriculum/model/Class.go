package model

import (
	"ModEd/core"
	"time"
)

type Class struct {
	core.BaseModel
	CourseId uint      `gorm:"not null" csv:"course_id" json:"CourseId" form:"label:Course;placeholder:Select Course;type:select;required:true;fk:Course;fklabel:Name"`
	Course   Course    `gorm:"foreignKey:CourseId;references:ID" form:"-"`
	Section  int       `gorm:"not null" csv:"section" json:"Section" form:"label:Section;placeholder:Enter Section Number;type:number;required:true"`
	Schedule time.Time `gorm:"not null" csv:"schedule" json:"Schedule" form:"label:Schedule;placeholder:Select Schedule;type:datetime-local;required:true"`
	// StudentList []model.Student    `gorm:"many2many:class_students" csv:"-" json:"-"`
	// Instructors []model.Instructor `gorm:"many2many:class_instructors;" csv:"-" json:"-"`
}

func (Class) TableName() string {
	return "classes"
}
