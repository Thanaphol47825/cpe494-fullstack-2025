package model

import (
	"ModEd/core"
)

type User struct {
	core.BaseModel
	Email    string `gorm:"not null"`
	Username string `gorm:"not null"`
	Password string `gorm:"not null"`
	IsAdmin  bool   `gorm:"not null;default:false"`
}

func (User) TableName() string {
	return "users"
}
