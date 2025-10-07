package model

import (
	"time"

	"gorm.io/gorm"
)

type Evaluation struct {
	gorm.Model
	SubmissionID   uint      `json:"submissionId" gorm:"not null"`
	SubmissionType string    `json:"submissionType" gorm:"type:varchar(50);not null"`
	InstructorID   uint      `json:"instructorId" gorm:"not null"`
	Score          uint      `json:"score" gorm:"not null"`
	MaxScore       uint      `json:"maxScore" gorm:"not null"`
	Feedback       string    `json:"feedback" gorm:"type:text"`
	EvaluatedAt    time.Time `json:"evaluatedAt" gorm:"type:timestamptz;not null"`
	Criteria       string    `json:"criteria" gorm:"type:text"`
	Status         string    `json:"status" gorm:"type:varchar(50);default:'draft'"`
}
