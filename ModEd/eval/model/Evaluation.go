package model

import (
	"time"

	"gorm.io/gorm"
)

type Evaluation struct {
	gorm.Model
	SubmissionID   uint      `json:"submissionId" gorm:"not null" form:"label:Submission;type:select;fk:Submission;required:true"`
	SubmissionType string    `json:"submissionType" gorm:"type:varchar(50);not null" form:"label:Submission Type;type:text;placeholder:assignment/quiz;required:true"`
	InstructorID   uint      `json:"instructorId" gorm:"not null" form:"label:Instructor;type:select;fk:Instructor;required:true"`
	Score          uint      `json:"score" gorm:"not null" form:"label:Score;type:number;placeholder:Enter score;required:true"`
	MaxScore       uint      `json:"maxScore" gorm:"not null" form:"label:Maximum Score;type:number;placeholder:100;required:true"`
	Feedback       string    `json:"feedback" gorm:"type:text" form:"label:Feedback;type:textarea;placeholder:Enter evaluation feedback"`
	EvaluatedAt    time.Time `json:"evaluatedAt" gorm:"type:timestamptz;not null" form:"label:Evaluated At;type:datetime-local;required:true"`
	Criteria       string    `json:"criteria" gorm:"type:text" form:"label:Criteria;type:textarea;placeholder:Enter evaluation criteria"`
	Status         string    `json:"status" gorm:"type:varchar(50);default:'draft'" form:"label:Status;type:text;placeholder:draft/finalized"`
}
