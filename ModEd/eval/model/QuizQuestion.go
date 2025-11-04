package model

import (
	"ModEd/core"
)

type QuizQuestion struct {
	core.BaseModel
	QuizID     uint   `json:"quizId" gorm:"not null;index" form:"label:Quiz;type:select;fk:Quiz;required:true"`
	Question   string `json:"question" gorm:"type:text;not null" form:"label:Question;type:textarea;placeholder:Enter question;required:true"`
	Answer     string `json:"answer" gorm:"type:text;not null" form:"label:Answer;type:textarea;placeholder:Enter correct answer;required:true"`
	OrderIndex uint   `json:"orderIndex" gorm:"type:int;default:0" form:"label:Order;type:number;placeholder:Question order"`
}
