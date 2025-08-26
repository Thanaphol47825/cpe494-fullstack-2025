package model

import (
	"ModEd/core"
	"time"
)

type LeaveType string

const (
	LeaveTypeSick      LeaveType = "Sick"
	LeaveTypeVacation  LeaveType = "Vacation"
	LeaveTypePersonal  LeaveType = "Personal"
	LeaveTypeMaternity LeaveType = "Maternity"
	LeaveTypeOther     LeaveType = "Other"
)

type BaseLeaveRequest struct {
	core.BaseModel
	Status    string    `gorm:"default:Pending"`
	LeaveType LeaveType `gorm:"type:varchar(20)" json:"leave_type"`
	Reason    string    `gorm:"type:text" json:"reason"`
	LeaveDate time.Time `json:"leave_date"`
}

func (b *BaseLeaveRequest) SetStatus(status string) {
	b.Status = status
}

func (b *BaseLeaveRequest) SetReason(reason string) {
	b.Reason = reason
}

func (lt LeaveType) IsValid() bool {
	switch lt {
	case LeaveTypeSick, LeaveTypeVacation, LeaveTypePersonal, LeaveTypeMaternity, LeaveTypeOther:
		return true
	}
	return false
}

func (b *BaseLeaveRequest) ApplyStatus(action Action, reason string) error {
	return ApplyStatus(b, action, reason)
}
