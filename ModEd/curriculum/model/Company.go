// MEP-1009 Student Internship
package model

import "ModEd/core"

type Company struct {
	core.BaseModel
	CompanyName    string `gorm:"type:varchar(255)" json:"company_name" csv:"CompanyName"`
	CompanyAddress string `gorm:"type:varchar(255)" json:"company_address" csv:"CompanyAddress"`
}

func (Company) TableName() string {
	return "companies"
}
