package model

import (
	"time"

	"gorm.io/gorm"
)

type AssignmentSubmission struct {
	gorm.Model
	AssignmentID   uint      `json:"assignmentId" gorm:"not null" form:"label:Assignment;type:select;fk:Assignment;required:true"`
	StudentID      uint      `json:"studentId" gorm:"not null" form:"label:Student;type:select;fk:Student;required:true"`
	SubmittedAt    time.Time `json:"submittedAt" gorm:"type:timestamptz;not null" form:"label:Submitted At;type:datetime-local;required:true"`
	Content        string    `json:"content" gorm:"type:text" form:"label:Content;type:textarea;placeholder:Enter submission content"`
	AttachmentPath string    `json:"attachmentPath" gorm:"type:varchar(500)" form:"label:Attachment Path;type:text;placeholder:Path to attachment file"`
	Score          *uint     `json:"score" gorm:"type:int" form:"label:Score;type:number;placeholder:Enter score"`
	Feedback       string    `json:"feedback" gorm:"type:text" form:"label:Feedback;type:textarea;placeholder:Enter feedback"`
	IsLate         bool      `json:"isLate" gorm:"default:false" form:"label:Late Submission;type:checkbox"`
	Status         string    `json:"status" gorm:"type:varchar(50);default:'submitted'" form:"label:Status;type:text;placeholder:submitted/graded"`
}
