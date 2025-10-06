package model

import (
	"errors"
	"time"

	"ModEd/core"

	"gorm.io/gorm"
)

type Instructor struct {
	core.BaseModel
	InstructorCode string     `gorm:"not null;unique" csv:"instructor_code" json:"instructor_code" form:"text" label:"Instructor Code"`
	FirstName      string     `gorm:"not null" csv:"first_name" json:"first_name" form:"text" label:"First Name"`
	LastName       string     `gorm:"not null" csv:"last_name" json:"last_name" form:"text" label:"Last Name"`
	Email          string     `gorm:"not null" csv:"email" json:"email" form:"email" label:"Email Address"`
	StartDate      *time.Time `csv:"start_date" json:"start_date" form:"date" label:"Start Date"`
	Department     *string    `csv:"department" json:"department" form:"text" label:"Department"`

	Gender             *string  `json:"Gender"             csv:"gender" form:"select" label:"Gender"`
	CitizenID          *string  `json:"CitizenID"          csv:"citizen_id" form:"text" label:"Citizen ID"`
	PhoneNumber        *string  `json:"PhoneNumber"        csv:"phone_number" form:"tel" label:"Phone Number"`
	Salary             *float64 `json:"Salary"             csv:"salary" form:"number" label:"Salary (THB)"`
	AcademicPosition   *int     `json:"AcademicPosition"   csv:"academic_position" form:"select" label:"Academic Position"`     // 0=NONE,1=ASSISTANT_PROF,2=ASSOCIATE_PROF,3=PROFESSOR
	DepartmentPosition *int     `json:"DepartmentPosition" csv:"department_position" form:"select" label:"Department Position"` // 0=NONE,1=HEAD,2=DEPUTY,3=SECRETARY
}

func (Instructor) TableName() string {
	return "instructors"
}

func (i Instructor) Validate() error {
	if i.InstructorCode == "" {
		return errors.New("instructor code is required")
	}
	if i.FirstName == "" {
		return errors.New("first name is required")
	}
	if i.LastName == "" {
		return errors.New("last name is required")
	}
	if i.Email == "" {
		return errors.New("email is required")
	}
	return nil
}

func UpdateInstructorByCode(db *gorm.DB, code string, updated map[string]any) error {
	return db.Model(&Instructor{}).Where("instructor_code = ?", code).Updates(updated).Error
}

func DeleteInstructorByCode(db *gorm.DB, code string) error {
	return db.Where("instructor_code = ?", code).Delete(&Instructor{}).Error
}

func ManualAddInstructor(db *gorm.DB, instructor *Instructor) error {
	return db.Create(instructor).Error
}
