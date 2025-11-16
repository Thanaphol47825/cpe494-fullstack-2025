// MEP-1009 Student Internship
package model

import (
	"ModEd/core"
	"time"
)

type InternshipAttendance struct {
	core.BaseModel
	Date                  time.Time             `gorm:"type:date" csv:"date" json:"date"`
	CheckInTime           time.Time             `gorm:"type:time" csv:"check_in_time" json:"check_in_time"`
	CheckOutTime          *time.Time            `gorm:"type:time" csv:"check_out_time" json:"check_out_time"`
	CheckInStatus         bool                  `gorm:"type:bool" csv:"check_in_status" json:"check_in_status"`
	AssingWork            string                `gorm:"type:varchar(255)" csv:"assing_work" json:"assing_work"`
	StudentInfoID         uint                  `gorm:"not null" csv:"student_info_id" json:"student_info_id"`
	InternshipInformation InternshipInformation `gorm:"foreignKey:StudentInfoID;references:ID"`
	*core.SerializableRecord
}

func (InternshipAttendance) TableName() string {
	return "internship_attendance"
}
