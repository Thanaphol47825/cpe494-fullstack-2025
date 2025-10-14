package model

import (
	"time"

	"ModEd/core"
)

type AssignmentProgress struct {
	core.BaseModel
	AssignmentID      uint      `json:"assignmentId" gorm:"not null" form:"label:Assignment;type:select;fk:Assignment;required:true"`
	TotalStudents     uint      `json:"totalStudents" gorm:"not null" form:"label:Total Students;type:number;placeholder:Enter total students;required:true"`
	SubmittedCount    uint      `json:"submittedCount" gorm:"default:0" form:"label:Submitted Count;type:number;placeholder:0"`
	NotSubmittedCount uint      `json:"notSubmittedCount" gorm:"default:0" form:"label:Not Submitted Count;type:number;placeholder:0"`
	GradedCount       uint      `json:"gradedCount" gorm:"default:0" form:"label:Graded Count;type:number;placeholder:0"`
	NotGradedCount    uint      `json:"notGradedCount" gorm:"default:0" form:"label:Not Graded Count;type:number;placeholder:0"`
	AverageScore      float64   `json:"averageScore" gorm:"type:decimal(5,2)" form:"label:Average Score;type:number;placeholder:0.00"`
	SubmissionRate    string    `json:"submissionRate" gorm:"type:varchar(10)" form:"label:Submission Rate;type:text;placeholder:0%"`
	LastUpdated       time.Time `json:"lastUpdated" gorm:"type:timestamptz;not null" form:"label:Last Updated;type:datetime-local;required:true"`
	Status            string    `json:"status" gorm:"type:varchar(50);default:'active'" form:"label:Status;type:text;placeholder:active/inactive"`
}
