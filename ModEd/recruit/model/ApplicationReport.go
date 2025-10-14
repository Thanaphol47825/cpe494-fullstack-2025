// MEP-1003 Student Recruitment
package model

import (
	"ModEd/common/model"
	"ModEd/core"
)

type ApplicationReport struct {
	core.BaseModel

	ApplicantID uint      `gorm:"not null" json:"applicant_id" csv:"applicant_id" label:"Applicant ID" form:"number"`
	Applicant   Applicant `gorm:"foreignKey:ApplicantID;references:ID" json:"-" form:"-"`

	ApplicationRoundsID uint             `gorm:"not null" json:"application_rounds_id" csv:"application_rounds_id" label:"Application Round ID" form:"number"`
	ApplicationRound    ApplicationRound `gorm:"foreignKey:ApplicationRoundsID;references:ID" json:"-" form:"-"`

	FacultyID uint           `json:"faculty_id" csv:"faculty_id" label:"Faculty ID" form:"number"`
	Faculty   *model.Faculty `gorm:"foreignKey:FacultyID;references:ID" json:"-" form:"-"`

	DepartmentID uint              `json:"department_id" csv:"department_id" label:"Department ID" form:"number"`
	Department   *model.Department `gorm:"foreignKey:DepartmentID;references:ID" json:"-" form:"-"`

	Program string `gorm:"type:varchar(50);default:''" json:"program" csv:"program" label:"Program Type" form:"text"`

	ApplicationStatuses string `gorm:"type:varchar(50);default:'Pending'" json:"application_statuses" csv:"application_statuses" label:"Application Status" form:"select"`
}
