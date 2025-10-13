package model

import (
	"ModEd/core"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type InternWorkExperience struct {
	core.BaseModel
	StudentId   uint          `gorm:"not null" json:"student_id"`
	Student     InternStudent `gorm:"foreignKey:StudentId;references:ID" json:"-"`
	CompanyId   uint          `gorm:"not null" json:"company_id"`
	Company     Company       `gorm:"foreignKey:CompanyId;references:ID"`
	CompanyName string        `gorm:"-" json:"company_name,omitempty"`
	Detail      string        `gorm:"type:text" csv:"detail" json:"detail"`
	StartDate   time.Time     `gorm:"type:date" csv:"start_date" json:"start_date"`
	EndDate     time.Time     `gorm:"type:date" csv:"end_date" json:"end_date"`
}

// Custom unmarshaling to handle company_name input
func (iwe *InternWorkExperience) UnmarshalJSON(data []byte) error {
	// Create a temporary struct to avoid recursion
	type Alias InternWorkExperience
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(iwe),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	return nil
}

// Method to resolve company name to ID
func (iwe *InternWorkExperience) ResolveCompanyName(db *gorm.DB) error {
	if iwe.CompanyName != "" && iwe.CompanyId == 0 {
		var company Company
		result := db.Where("company_name = ?", iwe.CompanyName).First(&company)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				// Create new company
				company = Company{
					CompanyName: iwe.CompanyName,
				}
				if err := db.Create(&company).Error; err != nil {
					return err
				}
			} else {
				return result.Error
			}
		}

		iwe.CompanyId = company.ID
		iwe.CompanyName = "" // Clear the virtual field
	}

	return nil
}
