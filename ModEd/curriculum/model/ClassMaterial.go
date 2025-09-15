package model

import (
	"ModEd/core"
)

type ClassMaterial struct {
	core.BaseModel
	ClassId  uint   `gorm:"not null;" csv:"class_id"`
	Class    Class  `gorm:"foreignKey:ClassId;references:ID"`
	FileName string `gorm:"type:varchar(100);not null;" csv:"file_name"`
	FilePath string `gorm:"type:varchar(255);not null;" csv:"file_path"`
}

func (ClassMaterial) TableName() string {
	return "class_materials"
}
