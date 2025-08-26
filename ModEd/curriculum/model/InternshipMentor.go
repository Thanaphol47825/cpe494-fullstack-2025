// MEP-1009 Student Internship
package model

import "ModEd/core"

type InternshipMentor struct {
	core.BaseModel
	MentorFirstName string  `gorm:"type:varchar(255)" json:"mentor_first_name" csv:"MentorFirstName"`
	MentorLastName  string  `gorm:"type:varchar(255)" json:"mentor_last_name" csv:"MentorLastName"`
	MentorEmail     string  `gorm:"type:varchar(255)" json:"mentor_email" csv:"MentorEmail"`
	MentorPhone     string  `gorm:"type:varchar(255)" json:"mentor_phone" csv:"MentorPhone"`
	CompanyId       uint    `gorm:"not null" json:"company_id" csv:"CompanyId"`
	Company         Company `gorm:"foreignKey:CompanyId;references:ID"`
}
