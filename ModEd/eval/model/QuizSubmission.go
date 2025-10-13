package model

import (
	"time"

	"gorm.io/gorm"
)

type QuizSubmission struct {
	gorm.Model
	QuizID      uint      `json:"quizId" gorm:"not null" form:"label:Quiz;type:select;fk:Quiz;required:true"`
	StudentID   uint      `json:"studentId" gorm:"not null" form:"label:Student;type:select;fk:Student;required:true"`
	StartedAt   time.Time `json:"startedAt" gorm:"type:timestamptz;not null" form:"label:Started At;type:datetime-local;required:true"`
	SubmittedAt time.Time `json:"submittedAt" gorm:"type:timestamptz;not null" form:"label:Submitted At;type:datetime-local;required:true"`
	Answers     string    `json:"answers" gorm:"type:text" form:"label:Answers;type:textarea;placeholder:Enter answers as JSON"`
	Score       *uint     `json:"score" gorm:"type:int" form:"label:Score;type:number;placeholder:Enter score"`
	TimeSpent   uint      `json:"timeSpent" gorm:"type:int" form:"label:Time Spent (minutes);type:number;placeholder:Time in minutes"`
	IsLate      bool      `json:"isLate" gorm:"default:false" form:"label:Late Submission;type:checkbox"`
	Status      string    `json:"status" gorm:"type:varchar(50);default:'submitted'" form:"label:Status;type:text;placeholder:submitted/graded"`
}
