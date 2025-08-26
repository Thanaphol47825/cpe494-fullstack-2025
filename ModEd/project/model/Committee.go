package model

import (
	"gorm.io/gorm"
)

type Committee struct {
	gorm.Model
	InstructorId    uint `gorm:"type:text;not null;index"`
	SeniorProjectId uint
	SeniorProject   SeniorProject `gorm:"foreignKey:SeniorProjectId"`
}
