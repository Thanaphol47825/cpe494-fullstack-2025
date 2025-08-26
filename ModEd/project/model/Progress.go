package model

import (
	"ModEd/core"
    "time"
)

type Progress struct {
    core.BaseModel
    AssignmentID uint
    Detail       string
    Status       string
    SubmittedAt  time.Time
}
