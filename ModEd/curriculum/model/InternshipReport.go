package model

import "ModEd/core"

type InternshipReport struct {
	core.BaseModel
	ReportScore int `gorm:"type:int" form:"" json:"ReportScore"`
}
