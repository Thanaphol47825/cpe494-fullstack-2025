// MEP-1009 Student Internship
// Advisor
package model

import (
	commonModel "ModEd/common/model"

	"gorm.io/gorm"
)

type Advisor struct {
	gorm.Model
	AdvisorId int                    `gorm:"not null;index" json:"advisor_id"`
	Advisor   commonModel.Instructor `gorm:"foreignKey:AdvisorId" json:"advisor"`
	// Students  []commonModel.Student  `gorm:"many2many:student_advisor_students;"`
}
