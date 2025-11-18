// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
	"time"
)


type InternCertificate struct {
    core.BaseModel
    CertificateNumber string    `json:"certificate_number"`
    DateOfIssue       time.Time `json:"date_of_issue"`
    CertificateId     uint      `json:"certificate_id"`
    InternStudentId   uint      `json:"intern_student_id"`
    Certificate       Certificate
    InternStudent     InternStudent
}

