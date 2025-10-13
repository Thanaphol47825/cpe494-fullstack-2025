package model

import (
	"errors"
	"time"

	"ModEd/core"

	"gorm.io/gorm"
)

type Student struct {
	core.BaseModel
	StudentCode string         `gorm:"not null;unique" csv:"student_code" json:"student_code" form:"label:Student Code;placeholder:Enter student code;type:text;format:text;required:true"`
	FirstName   string         `csv:"first_name" json:"first_name" form:"label:First Name;placeholder:Enter first name;type:text;format:text;required:true"`
	LastName    string         `csv:"last_name" json:"last_name" form:"label:Last Name;placeholder:Enter last name;type:text;format:text;required:true"`
	Email       string         `csv:"email" json:"email" form:"label:Email Address;placeholder:Enter email address;type:email;format:email;required:true"`
	StartDate   time.Time      `csv:"start_date" json:"start_date" form:"label:Start Date;type:date;format:date;required:true"`
	BirthDate   time.Time      `csv:"birth_date" json:"birth_date" form:"label:Birth Date;type:date;format:date;required:true"`
	Program     ProgramType    `csv:"program" json:"program" form:"label:Program;type:select;fk:ProgramType;format:text"`
	Department  string         `csv:"department" json:"department" form:"label:Department;placeholder:Enter department;type:text;format:text"`
	Status      *StudentStatus `csv:"status" json:"status" form:"label:Status;type:select;fk:StudentStatus;format:text"`

	Gender      *string `csv:"Gender" json:"Gender,omitempty" form:"label:Gender;type:select;format:text"`
	CitizenID   *string `csv:"CitizenID" json:"CitizenID,omitempty" form:"label:Citizen ID;placeholder:Enter citizen ID;type:text;format:text"`
	PhoneNumber *string `csv:"PhoneNumber" json:"PhoneNumber,omitempty" form:"label:Phone Number;placeholder:Enter phone number;type:tel;format:phone"`
	AdvisorCode *string `csv:"AdvisorCode" json:"AdvisorCode,omitempty" form:"label:Advisor Code;placeholder:Enter advisor code;type:select;fk:InternshipMentor;fklabel:MentorFirstName;format:text"`

	// FK → Instructor.InstructorCode
	Advisor *Instructor `json:"Advisor,omitempty" gorm:"foreignKey:AdvisorCode;references:InstructorCode" form:"-"`

	// FK → User
	UserId *uint `gorm:"index"`
}

func (Student) TableName() string {
	return "students"
}

func (s Student) Validate() error {
	if s.StudentCode == "" {
		return errors.New("student code is required")
	}
	return nil
}

func UpdateStudentByCode(db *gorm.DB, code string, updated map[string]interface{}) error {
	return db.Model(&Student{}).Where("student_code = ?", code).Updates(updated).Error
}

func DeleteStudentByCode(db *gorm.DB, code string) error {
	return db.Where("student_code = ?", code).Delete(&Student{}).Error
}

func ManualAddStudent(db *gorm.DB, student *Student) error {
	return db.Create(student).Error
}
