// MEP-1003 Student Recruitment
package model

import (
	"ModEd/common/model"
	"ModEd/core"
)

type InterviewCriteria struct {
    core.BaseModel
    ApplicationRoundsID uint             `csv:"application_rounds_id" json:"application_rounds_id" form:"label:Application Round ID;placeholder:Select application round;type:number;required:true"`
    ApplicationRound    ApplicationRound `gorm:"foreignKey:ApplicationRoundsID;references:ID" form:"-"`

    FacultyID uint           `csv:"faculty_id" json:"faculty_id" form:"label:Faculty ID;placeholder:Select faculty;type:number;required:true"`
    Faculty   *model.Faculty `gorm:"foreignKey:FacultyID;references:ID" form:"-"`

    DepartmentID uint              `csv:"department_id" json:"department_id" form:"label:Department ID;placeholder:Select department;type:number;required:true"`
    Department   *model.Department `gorm:"foreignKey:DepartmentID;references:ID" form:"-"`

    PassingScore float64 `csv:"passing_score" json:"passing_score" form:"label:Passing Score;placeholder:Enter passing score;type:number;required:true"`
}
