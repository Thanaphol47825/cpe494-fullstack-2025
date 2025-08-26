package util

import (
	"encoding/json"
	"os"

	"ModEd/common/model"
	"ModEd/core"
)

func ImportFacultiesFromJSON(filePath string, db *core.ModEdApplication) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	var faculties []model.Faculty
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&faculties); err != nil {
		return err
	}

	for _, faculty := range faculties {
		db.DB.Create(&faculty)
	}
	return nil
}

func ImportDepartmentsFromJSON(filePath string, db *core.ModEdApplication) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	var departments []model.Department
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&departments); err != nil {
		return err
	}

	for _, department := range departments {
		db.DB.Create(&department)
	}
	return nil
}

func ImportStudentsFromJSON(filePath string, db *core.ModEdApplication) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	var students []model.Student
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&students); err != nil {
		return err
	}

	for _, student := range students {
		db.DB.Create(&student)
	}
	return nil
}

func ImportInstructorsFromJSON(filePath string, db *core.ModEdApplication) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	var instructors []model.Instructor
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&instructors); err != nil {
		return err
	}

	for _, instructor := range instructors {
		db.DB.Create(&instructor)
	}
	return nil
}