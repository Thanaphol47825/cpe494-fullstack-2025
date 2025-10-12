// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
)

type Certificate struct {
	core.BaseModel
	CertificateName string  `gorm:"type:varchar(255)" json:"certificate_name" csv:"certificate_name"`
	CompanyId       uint    `gorm:"not null" json:"company_id" csv:"company_id"`
	Company         Company `gorm:"foreignKey:CompanyId;references:ID"`
}
