// MEP-1003 Student Recruitment
package model

import (
	"ModEd/core"
)

type ApplicationRound struct {
	core.BaseModel
	RoundName string `csv:"round_name" json:"round_name"`
}
