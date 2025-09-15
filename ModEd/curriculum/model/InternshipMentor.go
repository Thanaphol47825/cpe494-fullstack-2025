// MEP-1009 Student Internship
package model

import "ModEd/core"

type InternshipMentor struct {
	core.BaseModel
	MentorFirstName string  `gorm:"type:varchar(255)" json:"mentor_first_name" csv:"mentor_first_name"`
	MentorLastName  string  `gorm:"type:varchar(255)" json:"mentor_last_name" csv:"mentor_last_name"`
	MentorEmail     string  `gorm:"type:varchar(255)" json:"mentor_email" csv:"mentor_email"`
	MentorPhone     string  `gorm:"type:varchar(255)" json:"mentor_phone" csv:"mentor_phone"`
	CompanyId       uint    `gorm:"not null" json:"company_id" csv:"company_id"`
	Company         Company `gorm:"foreignKey:CompanyId;references:ID"`
}
