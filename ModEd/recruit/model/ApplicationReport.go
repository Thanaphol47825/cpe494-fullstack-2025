package model

import (
	"ModEd/common/model"
	"ModEd/core"
)

type ApplicationReport struct {
	core.BaseModel

	ApplicantID uint      `gorm:"not null" json:"applicant_id" csv:"applicant_id" form:"label:Applicant;type:select;apiurl:/recruit/GetApplicantOptions;required:true"`
	Applicant   Applicant `gorm:"foreignKey:ApplicantID;references:ID" json:"applicant,omitempty" form:"-"`

	ApplicationRoundsID uint             `gorm:"not null" json:"application_rounds_id" csv:"application_rounds_id" form:"label:Application Round;type:select;apiurl:/recruit/GetApplicationRoundOptions;required:true"`
	ApplicationRound    ApplicationRound `gorm:"foreignKey:ApplicationRoundsID;references:ID" json:"application_round,omitempty" form:"-"`

	FacultyID uint          `json:"faculty_id" csv:"faculty_id" form:"label:Faculty;type:select;apiurl:/recruit/GetFacultyOptions"`
	Faculty   model.Faculty `gorm:"foreignKey:FacultyID;references:ID" json:"faculty,omitempty" form:"-"`

	DepartmentID uint             `json:"department_id" csv:"department_id" form:"label:Department;type:select;apiurl:/recruit/GetDepartmentOptions"`
	Department   model.Department `gorm:"foreignKey:DepartmentID;references:ID" json:"department,omitempty" form:"-"`

	Program             model.ProgramType `gorm:"default:0" json:"program" csv:"program" form:"label:Program Type;type:select;apiurl:/recruit/GetProgramTypeOptions"`
	ApplicationStatuses string            `gorm:"type:varchar(50);default:'Pending'" json:"application_statuses" csv:"application_statuses" form:"label:Application Status;type:select;apiurl:/recruit/GetApplicationStatusOptions"`
}
