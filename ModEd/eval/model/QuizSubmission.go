package model

import (
	"time"

	"ModEd/core"
)

type QuizSubmission struct {
	core.BaseModel
	QuizID      uint      `json:"quizId" gorm:"not null" form:"label:Quiz ID;type:number;required:true"`
	UserID      string    `json:"userId" gorm:"type:varchar(255)" form:"label:User ID;type:text"` // String to match user_roles table format
	StartedAt   time.Time `json:"startedAt" gorm:"type:timestamptz;not null" form:"label:Started At;type:datetime-local;required:true"`
	SubmittedAt time.Time `json:"submittedAt" gorm:"type:timestamptz;not null" form:"label:Submitted At;type:datetime-local;required:true"`
	Answers     string    `json:"answers" gorm:"type:text" form:"label:Answers;type:textarea;placeholder:Enter answers as JSON"`
	Score       *uint     `json:"score" gorm:"type:int" form:"label:Score;type:number;placeholder:Enter score"`
	TimeSpent   uint      `json:"timeSpent" gorm:"type:int" form:"label:Time Spent (minutes);type:number;placeholder:Time in minutes"`
	IsLate      bool      `json:"isLate" gorm:"default:false" form:"label:Late Submission;type:checkbox"`
	Status      string    `json:"status" gorm:"type:varchar(50);default:'submitted'" form:"label:Status;type:text;placeholder:submitted/graded"`
}
