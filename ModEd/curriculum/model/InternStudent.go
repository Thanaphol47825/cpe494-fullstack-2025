// MEP-1009 Student Internship
package model

import (
	// commonModel "ModEd/common/model"
	"ModEd/core"
)

type InternStudent struct {
	core.BaseModel
	InternStatus InternStatus        `gorm:"type:varchar(20)" csv:"intern_status" json:"intern_status"`
	StudentID    uint                `gorm:"not null"`
	// Student      commonModel.Student `gorm:"foreignKey:StudentID;references:ID"`
}
