package model

import (
	"ModEd/core"
	"time"
)

type CoursePlan struct {
	core.BaseModel
	CourseId     uint      `gorm:"not null" json:"course_id"`
	Course       Course    `gorm:"foreignKey:CourseId;references:ID"`
	Week         uint      `gorm:"not null" json:"week"`
	Date         time.Time `gorm:"not null" json:"date"`
	InstructorId uint      `gorm:"not null" json:"instructor_id"`
	// Instructor   common.Instructor `gorm:"-" json:"instructor"`
	Topic       string `gorm:"type:varchar(255);not null" json:"topic"`
	Description string `gorm:"type:varchar(255);not null" json:"description"`
}

func (CoursePlan) TableName() string {
	return "course_plans"
}
