// MEP-1010 Student Skill Mapping
package model

import (
	"ModEd/core"
)

type InternStudentSkill struct {
	core.BaseModel
	StudentId uint          `gorm:"not null;index:idx_student_skill,unique" json:"student_id"`
	Student   InternStudent `gorm:"foreignKey:StudentId;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	SkillId   uint          `gorm:"not null;index:idx_student_skill,unique" json:"skill_id"`
	Skill     InternSkill   `gorm:"foreignKey:SkillId;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Level     uint8         `gorm:"not null;default:1" json:"level"`
}
