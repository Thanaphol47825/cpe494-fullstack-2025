package model

import "ModEd/core"

type InternshipInformation struct {
	core.BaseModel

	InternStudentID    uint             `gorm:"not null" csv:"intern_student_id" json:"intern_student_id"`
	InternStudent      InternStudent    `gorm:"foreignKey:InternStudentID;references:ID"`
	CompanyId          uint             `gorm:"not null" csv:"company_id" json:"company_id"`
	InternshipCompany  Company          `gorm:"foreignKey:CompanyId;references:ID"`
	InternshipMentorID uint             `gorm:"not null" csv:"internship_mentor_id" json:"internship_mentor_id"`
	InternshipMentor   InternshipMentor `gorm:"foreignKey:InternshipMentorID;references:ID"`
	// *core.SerializableRecord
}

// func (InternshipInformation) TableName() string {
// 	return "internship_information"
// }
