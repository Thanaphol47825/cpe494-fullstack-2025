// MEP-1009 Student Internship
package model

import "ModEd/core"

type Company struct {
	core.BaseModel
	CompanyName    string `gorm:"type:varchar(255);not null;uniqueIndex:idx_company_name_deleted,where:deleted_at is null" csv:"company_name" json:"company_name" form:"label:Company Name;placeholder:Enter company name;type:text;required:true"`
	CompanyAddress string `gorm:"type:text" csv:"company_address" json:"company_address" form:"label:Company Address;placeholder:Enter company address;type:text"`
}
