// MEP-1003 Student Recruitment
package model

import (
	"ModEd/core"
)

type ApplicationRound struct {
	core.BaseModel
	RoundName string `csv:"round_name" json:"round_name"`
}

func (i *ApplicationRound) GetID() uint {
	return i.BaseModel.GetID()
}
func (i *ApplicationRound) FromCSV(csvData string) error {
	return nil
}
func (i *ApplicationRound) ToCSVRow() string {
	return ""
}
func (i *ApplicationRound) FromJSON(jsonData string) error {
	return nil
}
func (i *ApplicationRound) ToJSON() string {
	return ""
}
func (i *ApplicationRound) Validate() error {
	return nil
}
func (i *ApplicationRound) ToString() string {
	return ""
}
