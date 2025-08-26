package model

import (
	"gorm.io/gorm"
)

type Assessment struct {
	gorm.Model
<<<<<<< HEAD
	ProjectId        uint               `gorm:"not null;index"`
	Project          Project            `gorm:"foreignKey:ProjectId"`
	AssessmentCriteriaLink []AssessmentCriteriaLink `gorm:"foreignKey:AssessmentId"`
=======
	SeniorProjectId        uint                     `gorm:"not null;index"`
	// SeniorProject          SeniorProject            `gorm:"foreignKey:SeniorProjectId"`
	// AssessmentCriteriaLink []AssessmentCriteriaLink `gorm:"foreignKey:AssessmentId"`
>>>>>>> f7008661a34dd69e36292ec9cb65e51c14e4d181
}
