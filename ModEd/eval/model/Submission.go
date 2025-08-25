package model

import (
	"time"

	"gorm.io/gorm"
)

type Submission struct {
	gorm.Model
	Type         string    `json:"type" gorm:"type:varchar(50);not null"`
	Title        string    `json:"title" gorm:"type:varchar(255);not null"`
	StudentID    uint      `json:"studentId" gorm:"not null"`
	StudentName  string    `json:"studentName" gorm:"type:varchar(255);not null"`
	SubmittedAt  time.Time `json:"submittedAt" gorm:"type:datetime;not null"`
	Status       string    `json:"status" gorm:"type:varchar(50);default:'submitted'"`
	Score        *uint     `json:"score" gorm:"type:int"`
	MaxScore     uint      `json:"maxScore" gorm:"not null"`
	IsLate       bool      `json:"isLate" gorm:"default:false"`
	Feedback     string    `json:"feedback" gorm:"type:text"`
	LastModified time.Time `json:"lastModified" gorm:"type:datetime;not null"`
}
