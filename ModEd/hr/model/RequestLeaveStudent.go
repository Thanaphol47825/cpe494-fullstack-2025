package model

import "ModEd/core/validation"

type RequestLeaveStudent struct {
	BaseLeaveRequest
	StudentCode string `gorm:"not null" validation:"studentId" json:"student_code"`
}

func (RequestLeaveStudent) TableName() string {
	return "leave_requests_student"
}

func (r *RequestLeaveStudent) Validate() error {
	modelValidator := validation.NewModelValidator()

	if err := modelValidator.ModelValidate(r); err != nil {
		return err
	}

	return nil
}
