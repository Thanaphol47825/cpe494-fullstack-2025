// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
	"time"
)

type InternshipApplication struct {
	core.BaseModel
	TurninDate               time.Time      `gorm:"not null" csv:"TurninDate"`
	ApprovalUniversityStatus ApprovedStatus `gorm:"type:varchar(20)" csv:"ApprovalUniversityStatus"`
	ApprovalCompanyStatus    ApprovedStatus `gorm:"type:varchar(20)" csv:"ApprovalCompanyStatus"`
	CompanyId                uint           `gorm:"not null" csv:"CompanyId"`
	Company                  Company        `gorm:"foreignKey:CompanyId;references:ID"`
	StudentCode              string         `gorm:"type:varchar(255);not null" csv:"StudentCode"`
	Student                  InternStudent  `gorm:"foreignKey:StudentCode;references:StudentCode"`
}
