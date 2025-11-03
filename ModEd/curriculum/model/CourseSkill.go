package model

import (
	"ModEd/core"
)

type CourseSkill struct {
	core.BaseModel
	CourseId uint   `gorm:"not null" csv:"course_id" json:"CourseId" form:"label:Course;placeholder:Select Course;type:select;required:true;fk:Course;fklabel:Name"`
	Course   Course `json:"Course" gorm:"foreignKey:CourseId;references:ID" form:"-"`
	SkillId  uint   `json:"SkillId" gorm:"not null;column:skill_id" form:"label:Skill;type:select;required:true;multiple:true;max:3;apiurl:/curriculum/Skill/getSkillOptions"`
	Skill    Skill  `json:"Skill" gorm:"foreignKey:SkillId;references:ID" form:"-"`
}

func (CourseSkill) TableName() string {
	return "course_skills"
}
