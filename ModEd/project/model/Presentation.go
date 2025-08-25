package model

import (
	"gorm.io/gorm"
)

type Presentation struct {
    core.BaseModel
    ProjectID uint
    Title     string
    Date      time.Time

    AdvisorScore   Score    `gorm:"foreignKey:PresentationID"`
    CommitteeScores []Score `gorm:"foreignKey:PresentationID"`
}
