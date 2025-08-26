package model

import (
    "ModEd/core"
    
)

type SeniorProject struct{
    core.BaseModel // custom wrapper on top of gorm.model (adding serializable)

    Members []GroupMember 		`gorm:"foreignKey:ProjectId"` // 1:N students
    AdvisorAjarn Advisor 			`gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
    Committees []Committee		`gorm:"foreignKey:ProjectId"` // 1:N (should be M:N technically)
    Assignments []Assignment	`gorm:"foreignKey:ProjectId"` // 1:N
    Presentations []Presentation `gorm:"foreignKey:ProjectId"` // 1:N
    Report []Report				`gorm:"foreignKey:ProjectId"` // 1:N

    Assessment Assessment		`gorm:"foreignKey:ProjectId"` // 1:1
}

func (p SeniorProject) GetID() uint {
	return p.ID
}
