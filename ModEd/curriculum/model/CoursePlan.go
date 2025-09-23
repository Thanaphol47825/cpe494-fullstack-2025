package model

import (
	"ModEd/core"
	"time"
)

type CoursePlan struct {
	core.BaseModel
	CourseId     uint      `gorm:"not null" csv:"course_id"`
	Course       Course    `gorm:"foreignKey:CourseId;references:ID"`
	Week         uint      `gorm:"not null" csv:"week"`
	Date         time.Time `gorm:"not null" csv:"date"`
	InstructorId uint      `gorm:"not null" csv:"instructor_id"`
	// Instructor   common.Instructor `gorm:"-" csv:"instructor"`
	Topic       string `gorm:"type:varchar(255);not null" csv:"topic"`
	Description string `gorm:"type:varchar(255);not null" csv:"description"`
}

func (CoursePlan) TableName() string {
	return "course_plans"
}
