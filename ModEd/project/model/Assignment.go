package model

import (
	"gorm.io/gorm"
)

type Assignment struct {
    core.BaseModel
    ProjectID uint
    Title     string
    Deadline  time.Time

    Progresses []Progress   `gorm:"foreignKey:AssignmentID"`
    AdvisorScore   Score    `gorm:"foreignKey:AssignmentID"`
    CommitteeScores []Score `gorm:"foreignKey:AssignmentID"`
}
