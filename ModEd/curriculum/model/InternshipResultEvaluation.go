package model

import (
	"ModEd/core"
)

type InternshipResultEvaluation struct {
	core.BaseModel

	Comment                 string                `gorm:"type:varchar(255);not null"`
	Score                   uint                  `gorm:"not null"`
	InternshipInformationId uint                  `gorm:"not null" csv:"internship_information_id" json:"internship_information_id"`
	InternshipInformation   InternshipInformation `gorm:"foreignKey:InternshipInformationId;references:ID"`
	// *core.SerializableRecord
}
