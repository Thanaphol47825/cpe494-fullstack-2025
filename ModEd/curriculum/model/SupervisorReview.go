// MEP-1009 Student Internship
package model

import "ModEd/core"

type SupervisorReview struct {
	core.BaseModel
	InstructorScore uint `gorm:"type:int"`
	MentorScore     uint `gorm:"type:int"`
	*core.SerializableRecord
}

func (SupervisorReview) TableName() string {
	return "supervisor_review"
}
