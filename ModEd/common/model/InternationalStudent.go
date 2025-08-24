package model

// Wrote by MEP-0001

import (
	"ModEd/core"
)

type InternationalStudent struct {
	core.BaseModel
	Student
}

func (is InternationalStudent) Validate() error {
	return is.Student.Validate()
}
