package model

import (
	"ModEd/core"
)

type GroupMember struct {
	core.BaseModel

	StudentId uint `gorm:"not null:index"`
	ProjectId uint
}
