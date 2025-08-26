package model

import (
	"gorm.io/gorm"
)

type AssessmentCriteria struct {
	gorm.Model
	CriteriaName string `gorm:"not null"`
}
