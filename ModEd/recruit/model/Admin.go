// MEP-1003 Student Recruitment
package model

import "ModEd/core"

type Admin struct {
	core.BaseModel
	Username string `csv:"username"`
	Password string `csv:"password"`
}

func (i *Admin) GetID() uint {
	return i.BaseModel.GetID()
}
func (i *Admin) FromCSV(csvData string) error {
	return nil
}
func (i *Admin) ToCSVRow() string {
	return ""
}
func (i *Admin) FromJSON(jsonData string) error {
	return nil
}
func (i *Admin) ToJSON() string {
	return ""
}
func (i *Admin) Validate() error {
	return nil
}
func (i *Admin) ToString() string {
	return ""
}
