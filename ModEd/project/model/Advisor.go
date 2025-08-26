package model

import (
	"gorm.io/gorm"
)


type Advisor struct {
	gorm.Model
	IsPrimary       bool `gorm:"not null"`
	SeniorProjectId uint
	InstructorId    uint
	Project         Project `gorm:"foreignKey:ProjectId"`
}
