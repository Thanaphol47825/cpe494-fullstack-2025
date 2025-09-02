// MEP-1003 Student Recruitment
package model

import (
	"ModEd/common/model"
	"ModEd/core"
)

type ApplicationReport struct {
	core.BaseModel

	ApplicantID uint
	Applicant   Applicant `gorm:"foreignKey:ApplicantID;references:ID"`

	ApplicationRoundsID uint
	ApplicationRound    ApplicationRound `gorm:"foreignKey:ApplicationRoundsID;references:ID"`

	FacultyID uint
	Faculty   *model.Faculty `gorm:"foreignKey:FacultyID;references:ID"`

	DepartmentID uint
	Department   *model.Department `gorm:"foreignKey:DepartmentID;references:ID"`

	Program *model.ProgramType `gorm:"type:varchar(20)"`

	ApplicationStatuses ApplicationStatus `gorm:"type:varchar(20)"`
}
