package model

import (
	"time"

	"gorm.io/gorm"
)

type AssignmentProgress struct {
	gorm.Model
	AssignmentID      uint      `json:"assignmentId" gorm:"not null"`
	TotalStudents     uint      `json:"totalStudents" gorm:"not null"`
	SubmittedCount    uint      `json:"submittedCount" gorm:"default:0"`
	NotSubmittedCount uint      `json:"notSubmittedCount" gorm:"default:0"`
	GradedCount       uint      `json:"gradedCount" gorm:"default:0"`
	NotGradedCount    uint      `json:"notGradedCount" gorm:"default:0"`
	AverageScore      float64   `json:"averageScore" gorm:"type:decimal(5,2)"`
	SubmissionRate    string    `json:"submissionRate" gorm:"type:varchar(10)"`
	LastUpdated       time.Time `json:"lastUpdated" gorm:"type:timestamptz;not null"`
	Status            string    `json:"status" gorm:"type:varchar(50);default:'active'"`
}
