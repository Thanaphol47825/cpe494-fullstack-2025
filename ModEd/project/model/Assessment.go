package model

import (
	"gorm.io/gorm"
)

type Assessment struct {
	gorm.Model
	ProjectId        uint               `gorm:"not null;index"`
	Project          Project            `gorm:"foreignKey:ProjectId"`
	AssessmentCriteriaLink []AssessmentCriteriaLink `gorm:"foreignKey:AssessmentId"`
}
