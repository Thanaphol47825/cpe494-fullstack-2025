package model

import (
	"gorm.io/gorm"
)

type Advisor struct {
	gorm.Model
	IsPrimary       bool `gorm:"not null" json:"isPrimary"`
	SeniorProjectId uint `json:"seniorProjectId"`
	InstructorId    uint `json:"instructorId"`
	//SeniorProject   SeniorProject `gorm:"foreignKey:SeniorProjectId"`
}

func (p Advisor) GetID() uint {
	return p.ID
}
