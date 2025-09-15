// MEP-1009 Student Internship
package model

import "ModEd/core"

type Company struct {
	core.BaseModel
	CompanyName    string `gorm:"type:varchar(255)" json:"company_name" csv:"company_name"`
	CompanyAddress string `gorm:"type:varchar(255)" json:"company_address" csv:"company_address"`
}

func (Company) TableName() string {
	return "companies"
}
