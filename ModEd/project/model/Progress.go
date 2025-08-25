package model

import (
	"gorm.io/gorm"
)

type Progress struct {
    core.BaseModel
    AssignmentID uint
    Detail       string
    Status       string
    SubmittedAt  time.Time
}
