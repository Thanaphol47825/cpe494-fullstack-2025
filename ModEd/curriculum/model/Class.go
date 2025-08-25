package model

import (
	"ModEd/core"
	"time"
)

type Class struct {
	core.BaseModel
	// ClassId  uint      `gorm:"not null;uniqueIndex" csv:"class_id" json:"class_id"`
	CourseId uint      `gorm:"not null" csv:"course_id" json:"course_id"`
	Course   Course    `gorm:"foreignKey:CourseId;references:ID"`
	Section  int       `gorm:"not null" csv:"section" json:"section"`
	Schedule time.Time `gorm:"not null" csv:"schedule" json:"schedule"`
	// StudentList []model.Student    `gorm:"many2many:class_students" csv:"-" json:"-"`
	// Instructors []model.Instructor `gorm:"many2many:class_instructors;" csv:"-" json:"-"`
	*core.SerializableRecord
}

func (Class) TableName() string {
	return "classes"
}
