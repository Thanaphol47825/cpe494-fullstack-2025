package model

import (
	"ModEd/core"
	"time"
)

type InternWorkExperience struct {
	core.BaseModel
	StudentId uint          `gorm:"not null" json:"student_id"`
	Student   InternStudent `gorm:"foreignKey:StudentId;references:ID"`
	CompanyId uint          `gorm:"not null" json:"company_id"`
	Company   Company       `gorm:"foreignKey:CompanyId;references:ID"`
	Detail    string        `gorm:"type:text" csv:"detail" json:"detail"`
	StartDate time.Time     `gorm:"type:date" csv:"start_date" json:"start_date"`
	EndDate   time.Time     `gorm:"type:date" csv:"end_date" json:"end_date"`
}
