// MEP-1003 Student Recruitment
package model

import (
	"ModEd/core"
)

type ApplicationRound struct {
	core.BaseModel
	RoundName string `gorm:"not null" json:"round_name" csv:"round_name" form:"label:Round Name;placeholder:Enter round name;type:text;required:true"`
}
