package model

import (
	"ModEd/core"

	"gorm.io/gorm"
)

type CoursePlan struct {
	gorm.Model
	CourseId  uint   `gorm:"not null" json:"course_id"`
	Course    Course  `gorm:"foreignKey:CourseId;references:CourseId"`
	Week string `gorm:"not null" json:"week"`
	Date string `gorm:"not null" json:"date"`
	InstructorId string `gorm:"not null" json:"instructor_id"`
	Topic string `gorm:"type:varchar(255);not null" json:"topic"`
	Description string `gorm:"type:varchar(255);not null" json:"description"`
	*core.SerializableRecord
}