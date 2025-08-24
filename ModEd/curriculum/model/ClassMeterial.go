package model

import (
	"ModEd/core"
)

type ClassMaterial struct {
	core.BaseModel
	ClassId  uint   `gorm:"not null;" json:"class_id"`
	Class    Class  `gorm:"foreignKey:ClassId;references:ID"`
	FileName string `gorm:"type:varchar(100);not null" json:"file_name"`
	FilePath string `gorm:"type:varchar(255);not null" json:"file_path"`
	*core.SerializableRecord
}

func (ClassMaterial) TableName() string {
	return "class_materials"
}
