// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
	"time"
)

type InternCertificate struct {
	core.BaseModel
	CertificateNumber string        `gorm:"type:varchar(255)" json:"certificate_number" csv:"certificate_number"`
	DateOfIssue       time.Time     `gorm:"type:timestamp" json:"date_of_issue" csv:"date_of_issue"`
	CertificateId     uint          `gorm:"not null" json:"certificate_id" csv:"certificate_id"`
	InternStudentId   uint          `gorm:"not null" json:"intern_student_id" csv:"intern_student_id"`
	Certificate       Certificate   `gorm:"foreignKey:CertificateId;references:ID"`
	InternStudent     InternStudent `gorm:"foreignKey:InternStudentId;references:ID"`
}
