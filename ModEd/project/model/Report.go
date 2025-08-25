package model

import (
	"gorm.io/gorm"
)

type Report struct {
    core.BaseModel
    ProjectID uint
    Title     string
    SubmittedAt time.Time

    AdvisorScore   Score    `gorm:"foreignKey:ReportID"`
    CommitteeScores []Score `gorm:"foreignKey:ReportID"`
}
