package model

import (
	"gorm.io/gorm"
)


type Advisor struct {
	gorm.Model
	IsPrimary       bool `gorm:"not null"`
	SeniorProjectId uint
	InstructorId    uint
<<<<<<< HEAD
	Project         Project `gorm:"foreignKey:ProjectId"`
=======
	// SeniorProject   SeniorProject `gorm:"foreignKey:SeniorProjectId"`
>>>>>>> f7008661a34dd69e36292ec9cb65e51c14e4d181
}
