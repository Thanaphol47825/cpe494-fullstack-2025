package model

import (
	"errors"
	"time"

	"ModEd/core"

	"gorm.io/gorm"
)

type Student struct {
	core.BaseModel
	StudentCode string         `gorm:"not null;unique" csv:"student_code" json:"student_code" form:"text" label:"Student Code"`
	FirstName   string         `csv:"first_name" json:"first_name" form:"text" label:"First Name"`
	LastName    string         `csv:"last_name" json:"last_name" form:"text" label:"Last Name"`
	Email       string         `csv:"email" json:"email" form:"email" label:"Email Address"`
	StartDate   time.Time      `csv:"start_date" json:"start_date" form:"date" label:"Start Date"`
	BirthDate   time.Time      `csv:"birth_date" json:"birth_date" form:"date" label:"Birth Date"`
	Program     ProgramType    `csv:"program" json:"program" form:"select" label:"Program"`
	Department  string         `csv:"department" json:"department" form:"text" label:"Department"`
	Status      *StudentStatus `csv:"status" json:"status" form:"select" label:"Status"`

	Gender      *string `csv:"Gender" json:"Gender,omitempty" form:"select" label:"Gender"`
	CitizenID   *string `csv:"CitizenID" json:"CitizenID,omitempty" form:"text" label:"Citizen ID"`
	PhoneNumber *string `csv:"PhoneNumber" json:"PhoneNumber,omitempty" form:"tel" label:"Phone Number"`
	AdvisorCode *string `csv:"AdvisorCode" json:"AdvisorCode,omitempty" form:"text" label:"Advisor Code"`

	// FK → Instructor.InstructorCode
	Advisor *Instructor `json:"Advisor,omitempty" gorm:"foreignKey:AdvisorCode;references:InstructorCode" form:"-"`
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
