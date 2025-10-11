// MEP-1003 Student Recruitment
package model

import (
	"ModEd/core"
	"encoding/json"
	"time"
)

type Applicant struct {
	core.BaseModel

	FirstName         string    `gorm:"not null" json:"first_name"           csv:"first_name"           form:"label:First Name;placeholder:Enter first name;type:text;required:true"`
	LastName          string    `gorm:"not null" json:"last_name"            csv:"last_name"            form:"label:Last Name;placeholder:Enter last name;type:text;required:true"`
	Email             string    `gorm:"not null" json:"email"                csv:"email"                form:"label:Email;placeholder:Enter email address;type:email;required:true"`
	BirthDate         time.Time `gorm:"not null" json:"birth_date"           csv:"birth_date"           form:"label:Birth Date;placeholder:Select your birth date;type:date;required:true"`
	Address           string    `gorm:"not null" json:"address"              csv:"address"              form:"label:Address;placeholder:Enter home address;type:text;required:false"`
	Phonenumber       string    `gorm:"not null" json:"phone_number"         csv:"phone_number"         form:"label:Phone Number;placeholder:Enter phone number;type:tel;required:false"`
	GPAX              float32   `gorm:"not null" json:"gpax"                 csv:"gpax"                 form:"label:GPAX;placeholder:Enter GPAX score;type:number;required:false"`
	HighSchoolProgram string    `gorm:"not null" json:"high_school_program"  csv:"high_school_program"  form:"label:High School Program;placeholder:Enter your program;type:text;required:false"`

	TGAT1 float32 `gorm:"not null" json:"tgat1" csv:"tgat1" form:"label:TGAT 1;placeholder:Enter TGAT 1 score;type:number;required:false"`
	TGAT2 float32 `gorm:"not null" json:"tgat2" csv:"tgat2" form:"label:TGAT 2;placeholder:Enter TGAT 2 score;type:number;required:false"`
	TGAT3 float32 `gorm:"not null" json:"tgat3" csv:"tgat3" form:"label:TGAT 3;placeholder:Enter TGAT 3 score;type:number;required:false"`

	TPAT1 float32 `gorm:"not null" json:"tpat1" csv:"tpat1" form:"label:TPAT 1;placeholder:Enter TPAT 1 score;type:number;required:false"`
	TPAT2 float32 `gorm:"not null" json:"tpat2" csv:"tpat2" form:"label:TPAT 2;placeholder:Enter TPAT 2 score;type:number;required:false"`
	TPAT3 float32 `gorm:"not null" json:"tpat3" csv:"tpat3" form:"label:TPAT 3;placeholder:Enter TPAT 3 score;type:number;required:false"`
	TPAT4 float32 `gorm:"not null" json:"tpat4" csv:"tpat4" form:"label:TPAT 4;placeholder:Enter TPAT 4 score;type:number;required:false"`
	TPAT5 float32 `gorm:"not null" json:"tpat5" csv:"tpat5" form:"label:TPAT 5;placeholder:Enter TPAT 5 score;type:number;required:false"`

	ApplicantRoundInformation string  `form:"-"`
	PortfolioURL              string  `gorm:"not null" json:"portfolio_url"  csv:"portfolio_url"  form:"label:Portfolio URL;placeholder:Enter portfolio URL;type:url;required:false"`
	FamilyIncome              float32 `gorm:"not null" json:"family_income"  csv:"family_income"  form:"label:Family Income (THB);placeholder:Enter family income;type:number;required:false"`
	MathGrade                 float32 `gorm:"default:0" json:"math_grade"    csv:"math_grade"     form:"label:Math Grade;placeholder:Enter math grade;type:number;required:false"`
	ScienceGrade              float32 `gorm:"default:0" json:"science_grade" csv:"science_grade"  form:"label:Science Grade;placeholder:Enter science grade;type:number;required:false"`
	EnglishGrade              float32 `gorm:"default:0" json:"english_grade" csv:"english_grade"  form:"label:English Grade;placeholder:Enter English grade;type:number;required:false"`
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
