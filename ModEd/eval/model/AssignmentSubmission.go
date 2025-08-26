package model

import (
	"time"

	"gorm.io/gorm"
)

type AssignmentSubmission struct {
	gorm.Model
	AssignmentID   uint      `json:"assignmentId" gorm:"not null"`
	StudentID      uint      `json:"studentId" gorm:"not null"`
	SubmittedAt    time.Time `json:"submittedAt" gorm:"type:datetime;not null"`
	Content        string    `json:"content" gorm:"type:text"`
	AttachmentPath string    `json:"attachmentPath" gorm:"type:varchar(500)"`
	Score          *uint     `json:"score" gorm:"type:int"`
	Feedback       string    `json:"feedback" gorm:"type:text"`
	IsLate         bool      `json:"isLate" gorm:"default:false"`
	Status         string    `json:"status" gorm:"type:varchar(50);default:'submitted'"`
}
