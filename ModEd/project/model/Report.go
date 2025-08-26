package model

import (
	"ModEd/core"
    "time"
)

type Report struct {
    core.BaseModel
    ProjectID uint
    Title     string
    SubmittedAt time.Time

    AdvisorScore   Score    `gorm:"foreignKey:ReportID"`
    CommitteeScores []Score `gorm:"foreignKey:ReportID"`
}
