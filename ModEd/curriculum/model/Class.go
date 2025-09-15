package model

import (
	"ModEd/core"
	"time"
)

type Class struct {
	core.BaseModel
	CourseId uint      `gorm:"not null" csv:"course_id"`
	Course   Course    `gorm:"foreignKey:CourseId;references:ID"`
	Section  int       `gorm:"not null" csv:"section"`
	Schedule time.Time `gorm:"not null" csv:"schedule"`
	// StudentList []model.Student    `gorm:"many2many:class_students" csv:"-" json:"-"`
	// Instructors []model.Instructor `gorm:"many2many:class_instructors;" csv:"-" json:"-"`
}

func (Class) TableName() string {
	return "classes"
}
