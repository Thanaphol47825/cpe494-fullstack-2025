package main

import (
	"ModEd/core"
	"ModEd/testGenForm/model"

	"encoding/json"

	"fmt"
	"os"
)

func main() {
	action := "{{ RootURL }}/test/testGenForm"
	class := "grid grid-cols-1 md:grid-cols-2 gap-4"
	core.GenFormFromModel(model.Field{}, "UserForm", "POST", action, class)

	data, err := os.ReadFile("/workspace/ModEd/curriculum/data/curriculum/class.json")
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}
	fmt.Println(string(data))
	type Class struct {
		ID        uint   `json:"id"`
		CourseID  uint   `json:"course_id"`
		Section   uint   `json:"section"`
		Schedule  string `json:"schedule"`
		CreatedAt string `json:"created_at"`
		UpdatedAt string `json:"updated_at"`
	}

	// classes := make([]Class, 0)
	var classes []Class

	err = json.Unmarshal(data, &classes)
	if err != nil {
		fmt.Println("Error unmarshaling JSON:", err)
		return
	}

	// companies := []model.Field{
	// 	{Name: "A", Surname: "B"},
	// 	{Name: "C", Surname: "D"},
	// }
	core.GenTableFromModels(data)
}
