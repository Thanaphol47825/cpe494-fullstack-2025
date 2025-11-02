package model

import (
	"ModEd/core"
	"time"
)

type InternshipAnnouncement struct {
	core.BaseModel

	Topic       string    `gorm:"type:varchar(255);not null" json:"topic" csv:"topic"`
	Description string    `gorm:"type:text" json:"description" csv:"description"`
	DateStart   time.Time `gorm:"type:date;not null" json:"date_start" csv:"date_start"`
	DateEnd     time.Time `gorm:"type:date;not null" json:"date_end" csv:"date_end"`
	AuthorId    int       `gorm:"not null" json:"author_id" csv:"author_id"`
}
