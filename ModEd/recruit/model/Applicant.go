// MEP-1003 Student Recruitment
package model

import (
	"ModEd/core"
	"encoding/json"
	"time"
)

type Applicant struct {
	core.BaseModel

	FirstName         string    `gorm:"not null" json:"first_name"           csv:"first_name"           label:"First Name"            form:"text"`
	LastName          string    `gorm:"not null" json:"last_name"            csv:"last_name"            label:"Last Name"             form:"text"`
	Email             string    `gorm:"not null" json:"email"                 csv:"email"                label:"Email"                  form:"email"`
	BirthDate         time.Time `gorm:"not null" json:"birth_date"           csv:"birth_date"           label:"Birth Date"            form:"date"`
	Address           string    `gorm:"not null" json:"address"               csv:"address"              label:"Address"               form:"text"`
	Phonenumber       string    `gorm:"not null" json:"phone_number"         csv:"phone_number"         label:"Phone Number"          form:"tel"`
	GPAX              float32   `gorm:"not null" json:"gpax"                  csv:"gpax"                 label:"GPAX"                  form:"number"`
	HighSchoolProgram string    `gorm:"not null" json:"high_school_program"  csv:"high_school_program"  label:"High School Program"   form:"text"`

	TGAT1 float32 `gorm:"not null" json:"tgat1" csv:"tgat1" label:"TGAT 1" form:"number"`
	TGAT2 float32 `gorm:"not null" json:"tgat2" csv:"tgat2" label:"TGAT 2" form:"number"`
	TGAT3 float32 `gorm:"not null" json:"tgat3" csv:"tgat3" label:"TGAT 3" form:"number"`

	TPAT1 float32 `gorm:"not null" json:"tpat1" csv:"tpat1" label:"TPAT 1" form:"number"`
	TPAT2 float32 `gorm:"not null" json:"tpat2" csv:"tpat2" label:"TPAT 2" form:"number"`
	TPAT3 float32 `gorm:"not null" json:"tpat3" csv:"tpat3" label:"TPAT 3" form:"number"`
	TPAT4 float32 `gorm:"not null" json:"tpat4" csv:"tpat4" label:"TPAT 4" form:"number"`
	TPAT5 float32 `gorm:"not null" json:"tpat5" csv:"tpat5" label:"TPAT 5" form:"number"`

	ApplicantRoundInformation string  `label:"Round Information" form:"-"`
	PortfolioURL              string  `gorm:"not null" json:"portfolio_url"  csv:"portfolio_url"  label:"Portfolio URL"          form:"url"`
	FamilyIncome              float32 `gorm:"not null" json:"family_income"  csv:"family_income"  label:"Family Income (THB)"    form:"number"`
	MathGrade                 float32 `gorm:"default:0" json:"math_grade"    csv:"math_grade"     label:"Math Grade"             form:"number"`
	ScienceGrade              float32 `gorm:"default:0" json:"science_grade" csv:"science_grade"  label:"Science Grade"          form:"number"`
	EnglishGrade              float32 `gorm:"default:0" json:"english_grade" csv:"english_grade"  label:"English Grade"          form:"number"`
}

func (i *Applicant) SetRoundInfo(data map[string]string) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	i.ApplicantRoundInformation = string(jsonData)
	return nil
}

func (i *Applicant) GetRoundInfo() (map[string]string, error) {
	var data map[string]string
	err := json.Unmarshal([]byte(i.ApplicantRoundInformation), &data)
	if err != nil {
		return nil, err
	}
	return data, nil
}
