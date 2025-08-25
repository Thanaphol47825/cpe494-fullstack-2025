package model

import (
	"gorm.io/gorm"
)

type GroupMember struct {
	core.BaseModel

	StudentId uint `gorm:"not null:index"`
	ProjectId uint
}
