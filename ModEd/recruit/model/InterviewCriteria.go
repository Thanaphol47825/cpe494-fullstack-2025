// MEP-1003 Student Recruitment
package model

import (
	"ModEd/common/model"
	"ModEd/core"
)

type InterviewCriteria struct {
	core.BaseModel
	ApplicationRoundsID uint             `csv:"application_rounds_id" json:"application_rounds_id"`
	ApplicationRound    ApplicationRound `gorm:"foreignKey:ApplicationRoundsID;references:ID"`

	FacultyID uint           `csv:"faculty_id" json:"faculty_id"`
	Faculty   *model.Faculty `gorm:"foreignKey:FacultyID;references:ID"`

	DepartmentID uint              `csv:"department_id" json:"department_id"`
	Department   *model.Department `gorm:"foreignKey:DepartmentID;references:ID"`

	PassingScore float64 `csv:"passing_score" json:"passing_score"`
}

func (i *InterviewCriteria) GetID() uint {
	return i.BaseModel.GetID()
}
func (i *InterviewCriteria) FromCSV(csvData string) error {
	return nil
}
func (i *InterviewCriteria) ToCSVRow() string {
	return ""
}
func (i *InterviewCriteria) FromJSON(jsonData string) error {
	return nil
}
func (i *InterviewCriteria) ToJSON() string {
	return ""
}
func (i *InterviewCriteria) Validate() error {
	return nil
}
func (i *InterviewCriteria) ToString() string {
	return ""
}
