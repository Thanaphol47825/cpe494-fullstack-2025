// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
	"time"
)

type InternshipApplication struct {
	core.BaseModel
	TurninDate               time.Time      `gorm:"not null" csv:"turnin_date" json:"turnin_date"`
	ApprovalUniversityStatus ApprovedStatus `gorm:"type:varchar(20)" csv:"approval_university_status" json:"approval_university_status"`
	ApprovalCompanyStatus    ApprovedStatus `gorm:"type:varchar(20)" csv:"approval_company_status" json:"approval_company_status"`
	CompanyId                uint           `gorm:"not null" csv:"company_id" json:"company_id"`
	Company                  Company        `gorm:"foreignKey:CompanyId;references:ID"`
	StudentCode              string         `gorm:"type:varchar(255);not null" csv:"student_code" json:"student_code"`
	// Student                  InternStudent  `gorm:"foreignKey:StudentCode;references:StudentCode"`
}
