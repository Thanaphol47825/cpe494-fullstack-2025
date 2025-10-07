package model

import (
	"time"

	"gorm.io/gorm"
)

type Quiz struct {
	gorm.Model
	Title        string    `json:"title" gorm:"type:varchar(255);not null"`
	Description  string    `json:"description" gorm:"type:text"`
	DueDate      time.Time `json:"dueDate" gorm:"type:timestamptz;not null"`
	StartDate    time.Time `json:"startDate" gorm:"type:timestamptz;not null"`
	TimeLimit    uint      `json:"timeLimit" gorm:"type:int;not null;default:60"`
	MaxScore     uint      `json:"maxScore" gorm:"not null;default:100"`
	InstructorID uint      `json:"instructorId" gorm:"not null"`
	CourseID     uint      `json:"courseId" gorm:"not null"`
	IsReleased   bool      `json:"isReleased" gorm:"default:false"`
	IsActive     bool      `json:"isActive" gorm:"default:true"`
}
