package model

import (
	"ModEd/core"
)

// Admin user
// Username: admin
// Password: admin

type User struct {
	core.BaseModel
	Email      *string     `csv:"email"`
	Username   *string     `csv:"username"`
	Password   string      `gorm:"not null" csv:"password"`
	IsAdmin    bool        `gorm:"not null;default:false" csv:"is_admin"`
	Student    *Student    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Instructor *Instructor `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

func (User) TableName() string {
	return "users"
}
