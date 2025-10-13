package model

import (
	"time"

	"gorm.io/gorm"
)

type Submission struct {
	gorm.Model
	Type         string    `json:"type" gorm:"type:varchar(50);not null" form:"label:Submission Type;type:text;placeholder:assignment/quiz/project;required:true"`
	Title        string    `json:"title" gorm:"type:varchar(255);not null" form:"label:Submission Title;type:text;placeholder:Enter submission title;required:true"`
	StudentID    uint      `json:"studentId" gorm:"not null" form:"label:Student;type:select;fk:Student;required:true"`
	StudentName  string    `json:"studentName" gorm:"type:varchar(255);not null" form:"label:Student Name;type:text;placeholder:Enter student name;required:true"`
	SubmittedAt  time.Time `json:"submittedAt" gorm:"type:timestamptz;not null" form:"label:Submitted At;type:datetime-local;required:true"`
	Status       string    `json:"status" gorm:"type:varchar(50);default:'submitted'" form:"label:Status;type:text;placeholder:submitted/graded"`
	Score        *uint     `json:"score" gorm:"type:int" form:"label:Score;type:number;placeholder:Enter score"`
	MaxScore     uint      `json:"maxScore" gorm:"not null" form:"label:Maximum Score;type:number;placeholder:100;required:true"`
	IsLate       bool      `json:"isLate" gorm:"default:false" form:"label:Late Submission;type:checkbox"`
	Feedback     string    `json:"feedback" gorm:"type:text" form:"label:Feedback;type:textarea;placeholder:Enter feedback"`
	LastModified time.Time `json:"lastModified" gorm:"type:timestamptz;not null" form:"label:Last Modified;type:datetime-local;required:true"`
}
