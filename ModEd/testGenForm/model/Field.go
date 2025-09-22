package model

import "ModEd/core"

type Field struct {
	core.BaseModel
	Name    string `gorm:"type:varchar(255)" json:"Name" csv:"Name"`
	Surname string `gorm:"type:varchar(255)" json:"Surname" csv:"Surname"`
	Age     int    `gorm:"type:int" json:"Age" csv:"Age"`
}

func (Field) TableName() string {
	return "fields"
}
