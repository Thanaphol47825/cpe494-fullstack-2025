package model

import "ModEd/core/validation"

type RequestResignationInstructor struct {
	BaseStandardRequest
	InstructorCode string `gorm:"not null"`
}

func (r *RequestResignationInstructor) Validate() error {
	return validation.NewModelValidator().ModelValidate(r)
}
