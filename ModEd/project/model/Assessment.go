package model

import (
	"gorm.io/gorm"
)

type Assessment struct {
	gorm.Model
	SeniorProjectId        uint                     `gorm:"not null;index"`
	SeniorProject          SeniorProject            `gorm:"foreignKey:SeniorProjectId"`
	AssessmentCriteriaLink []AssessmentCriteriaLink `gorm:"foreignKey:AssessmentId"`
}
