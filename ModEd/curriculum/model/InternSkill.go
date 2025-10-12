package model

import (
	"ModEd/core"
)

type InternSkill struct {
	core.BaseModel                   
	SkillName string `gorm:"type:varchar(100);not null" csv:"skill_name" json:"skill_name"`
}

