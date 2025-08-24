package model

// Wrote by MEP-0001

import (
	"ModEd/core"
)

type RegularStudent struct {
	core.BaseModel
	Student
}

func (rs RegularStudent) Validate() error {
	return rs.Student.Validate()
}
