package model

import (
	"ModEd/common/model"
	"ModEd/core"
)

type Curriculum struct {
	core.BaseModel
	Name         string             `json:"Name" gorm:"not null" csv:"name" form:"label:Name;placeholder:Enter Curriculum Name;type:text;required:true"`
	StartYear    int                `json:"StartYear" gorm:"not null" csv:"start_year" form:"label:Start Year;placeholder:Enter Start Year;type:number;required:true"`
	EndYear      int                `json:"EndYear" gorm:"not null" csv:"end_year" form:"label:End Year;placeholder:Enter End Year;type:number;required:true"`
	DepartmentId uint               `json:"DepartmentId" gorm:"not null" csv:"department_id" form:"label:Department;type:select;required:true;fk:Department;fklabel:name"`
	Department   model.Department   `json:"Department" gorm:"foreignKey:DepartmentId;references:ID" csv:"-" form:"-"`
	ProgramType  *model.ProgramType `json:"ProgramType" gorm:"type:int;not null" csv:"program_type" form:"label:ProgramType;enum:ProgramType;type:select"`
	CourseList   []Course           `gorm:"foreignKey:CurriculumId;references:ID" form:"-"`
}

func (Curriculum) TableName() string {
	return "curriculums"
}
