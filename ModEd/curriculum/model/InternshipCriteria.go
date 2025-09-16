package model

import "ModEd/core"

type InternshipCriteria struct {
	core.BaseModel
	Title                   string                `gorm:"type:varchar(255);not null"`
	Description             string                `gorm:"type:varchar(255);not null"`
	Score                   uint                  `gorm:"type:int;not null"`
	InternshipApplicationId uint                  `gorm:"not null" csv:"internship_application_id" json:"internship_application_id"`
	InternshipApplication   InternshipApplication `gorm:"foreignKey:InternshipApplicationId;references:ID"`
	// *core.SerializableRecord
}
