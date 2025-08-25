package model

import "ModEd/core/validation"

type RequestLeaveInstructor struct {
	BaseLeaveRequest
	InstructorCode string `gorm:"not null"`
}

func (r *RequestLeaveInstructor) Validate() error {
	mv := validation.NewModelValidator()
	if err := mv.ModelValidate(r); err != nil {
		return err
	}
	return nil
}
