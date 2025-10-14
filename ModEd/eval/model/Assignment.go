package model

import (
	"time"

	"ModEd/core"
)

type Assignment struct {
	core.BaseModel
	Title       string    `json:"title" gorm:"type:varchar(255);not null" form:"label:Assignment Title;type:text;placeholder:Enter assignment title;required:true"`
	Description string    `json:"description" gorm:"type:text" form:"label:Description;type:textarea;placeholder:Describe the assignment"`
	DueDate     time.Time `json:"dueDate" gorm:"type:timestamptz;not null" form:"label:Due Date;type:datetime-local;required:true"`
	StartDate   time.Time `json:"startDate" gorm:"type:timestamptz;not null" form:"label:Start Date;type:datetime-local;required:true"`
	MaxScore    uint      `json:"maxScore" gorm:"not null;default:100" form:"label:Maximum Score;type:number;placeholder:100;required:true"`
	IsReleased  bool      `json:"isReleased" gorm:"default:false" form:"label:Released;type:checkbox"`
	IsActive    bool      `json:"isActive" gorm:"default:true" form:"label:Active;type:checkbox"`
}
