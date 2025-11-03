package model

import (
	"ModEd/core"
)

type Skill struct {
	core.BaseModel
	Name        string `json:"Name" gorm:"not null;column:name" form:"label:Name;type:text;required:true"`
	Description string `json:"Description" gorm:"type:varchar(255);column:description" form:"label:Description;type:textarea"`
}

func (Skill) TableName() string {
	return "skills"
}
