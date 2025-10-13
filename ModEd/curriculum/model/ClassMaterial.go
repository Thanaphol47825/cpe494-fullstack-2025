package model

import (
	"ModEd/core"
)

type ClassMaterial struct {
	core.BaseModel
	ClassId  uint   `gorm:"not null;" csv:"class_id" json:"ClassId" form:"label:Class;placeholder:Select Class;type:select;required:true;apiurl:/curriculum/Class/getClassOptions"`
	Class    Class  `gorm:"foreignKey:ClassId;references:ID" form:"-"`
	FileName string `gorm:"type:varchar(100);not null;" csv:"file_name" json:"FileName" form:"label:File Name;placeholder:Enter File Name;type:text;required:true"`
	FilePath string `gorm:"type:varchar(255);not null;" csv:"file_path" json:"FilePath" form:"label:File Path;placeholder:Enter File Path;type:text;required:true"`
}

func (ClassMaterial) TableName() string {
	return "class_materials"
}
