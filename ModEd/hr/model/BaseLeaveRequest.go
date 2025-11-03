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
	Status    string    `gorm:"default:Pending" json:"status" form:"-"`
	LeaveType LeaveType `gorm:"type:varchar(20)" json:"leave_type" form:"label:Leave Type;type:select;required:true"`
	Reason    string    `gorm:"type:text" json:"reason" form:"label:Reason;type:textarea;placeholder:Enter reason for leave;required:true"`
	LeaveDate time.Time `json:"leave_date" form:"label:Leave Date;type:date;required:true"`
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
