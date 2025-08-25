// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
	"time"
)

type InternshipAttendance struct {
	core.BaseModel
	Date          time.Time             `gorm:"type:date"`
	CheckInTime   time.Time             `gorm:"type:time"`
	CheckOutTime  time.Time             `gorm:"type:time"`
	CheckInStatus bool                  `gorm:"type:bool"`
	AssingWork    string                `gorm:"type:varchar(255)"`
	StudentInfoID uint                  `gorm:"not null"`
	Student       InternshipInformation `gorm:"foreignKey:StudentCode;references:StudentCode"`
	*core.SerializableRecord
}

func (InternshipAttendance) TableName() string {
	return "internship_attendance"
}