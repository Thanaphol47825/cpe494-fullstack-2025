package model

import (
	"time"

	"gorm.io/gorm"
)

type QuizSubmission struct {
	gorm.Model
	QuizID      uint      `json:"quizId" gorm:"not null"`
	StudentID   uint      `json:"studentId" gorm:"not null"`
	StartedAt   time.Time `json:"startedAt" gorm:"type:timestamptz;not null"`
	SubmittedAt time.Time `json:"submittedAt" gorm:"type:timestamptz;not null"`
	Answers     string    `json:"answers" gorm:"type:text"`
	Score       *uint     `json:"score" gorm:"type:int"`
	TimeSpent   uint      `json:"timeSpent" gorm:"type:int"`
	IsLate      bool      `json:"isLate" gorm:"default:false"`
	Status      string    `json:"status" gorm:"type:varchar(50);default:'submitted'"`
}
