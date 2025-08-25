package model

import (
	"gorm.io/gorm"
)

type Assessment struct {
    core.BaseModel
    ProjectID uint
    AdvisorScore   Score    `gorm:"foreignKey:AssessmentID"`
    CommitteeScores []Score `gorm:"foreignKey:AssessmentID"`
}
