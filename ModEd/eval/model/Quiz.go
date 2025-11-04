package model

import (
	"time"

	"ModEd/core"
)

type Quiz struct {
	core.BaseModel
	Title       string    `json:"title" gorm:"type:varchar(255);not null" form:"label:Quiz Title;type:text;placeholder:Enter quiz title;required:true"`
	Description string    `json:"description" gorm:"type:text" form:"label:Description;type:textarea;placeholder:Describe the quiz"`
	DueDate     time.Time `json:"dueDate" gorm:"type:timestamptz;not null" form:"label:Due Date;type:datetime-local;required:true"`
	StartDate   time.Time `json:"startDate" gorm:"type:timestamptz;not null" form:"label:Start Date;type:datetime-local;required:true"`
	TimeLimit   uint      `json:"timeLimit" gorm:"type:int;not null;default:60" form:"label:Time Limit (minutes);type:number;placeholder:60;required:true"`
	MaxScore    uint      `json:"maxScore" gorm:"not null;default:100" form:"label:Maximum Score;type:number;placeholder:100;required:true"`
}
