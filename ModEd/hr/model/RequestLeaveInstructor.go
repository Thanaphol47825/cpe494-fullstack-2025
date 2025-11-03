package model

import "ModEd/core/validation"

type RequestLeaveInstructor struct {
	BaseLeaveRequest
	InstructorCode string `gorm:"not null" json:"instructor_code" form:"label:Instructor;type:select;fk:Instructor;fklabel:InstructorCode;required:true"`
}

func (r *RequestLeaveInstructor) Validate() error {
	mv := validation.NewModelValidator()
	if err := mv.ModelValidate(r); err != nil {
		return err
	}
	return nil
}
