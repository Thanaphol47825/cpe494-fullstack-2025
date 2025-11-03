package model

import (
	"ModEd/core"
)

type CourseSkill struct {
	core.BaseModel
	CourseId uint   `json:"CourseId" gorm:"not null;column:course_id" form:"label:Course;type:select;fk:Course;fkLabelField:Name;required:true"`
	Course   Course `json:"Course" gorm:"foreignKey:CourseId;references:ID" form:"-"`
	SkillId  uint   `json:"SkillId" gorm:"not null;column:skill_id" form:"label:Skill;type:select;fk:Skill;fkLabelField:Name;required:true"`
	Skill    Skill  `json:"Skill" gorm:"foreignKey:SkillId;references:ID" form:"-"`
}

func (CourseSkill) TableName() string {
	return "course_skills"
}
