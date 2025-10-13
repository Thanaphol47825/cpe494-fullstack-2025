// MEP-1010 Student Skill Mapping
package model

import (

	"ModEd/core"
)

type InternStudentSkill struct {
	core.BaseModel
	StudentID uint          `gorm:"not null;index:idx_student_skill,unique" json:"student_id"`
	SkillID   uint          `gorm:"not null;index:idx_student_skill,unique" json:"skill_id"`
	Student   InternStudent `gorm:"foreignKey:StudentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Skill     InternSkill   `gorm:"foreignKey:SkillID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Level     uint8         `gorm:"not null;default:1" json:"level"`
}
