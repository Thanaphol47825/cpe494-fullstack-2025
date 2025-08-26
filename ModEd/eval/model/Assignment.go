package model

import (
	"time"

	"gorm.io/gorm"
)

type Assignment struct {
	gorm.Model
	Title        string    `json:"title" gorm:"type:varchar(255);not null"`
	Description  string    `json:"description" gorm:"type:text"`
	DueDate      time.Time `json:"dueDate" gorm:"type:datetime;not null"`
	StartDate    time.Time `json:"startDate" gorm:"type:datetime;not null"`
	MaxScore     uint      `json:"maxScore" gorm:"not null;default:100"`
	InstructorID uint      `json:"instructorId" gorm:"not null"`
	CourseID     uint      `json:"courseId" gorm:"not null"`
	IsReleased   bool      `json:"isReleased" gorm:"default:false"`
	IsActive     bool      `json:"isActive" gorm:"default:true"`
}
