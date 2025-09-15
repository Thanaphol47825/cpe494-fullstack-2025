// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
)

type InternStudent struct {
	core.BaseModel
	InternStatus InternStatus `gorm:"type:varchar(20)" csv:"intern_status" json:"intern_status"`
	StudentCode  string       `gorm:"type:varchar(255);not null;unique" csv:"student_code" json:"student_code"`
	// Student      commonModel.Student `gorm:"foreignKey:StudentCode;references:StudentCode" json:"student"`
}

func (InternStudent) TableName() string {
	return "intern_students"
}
