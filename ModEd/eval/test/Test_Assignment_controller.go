package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
)

const baseURL = "http://127.0.0.1:8080/eval/assignment"

func main() {
	createData := map[string]interface{}{
		"title":        "Go Test Assignment",
		"description":  "Test assignment using Go",
		"dueDate":      "2025-09-10T12:00:00Z",
		"startDate":    "2025-09-01T12:00:00Z",
		"maxScore":     100,
		"instructorId": 1,
		"courseId":     101,
		"isReleased":   true,
		"isActive":     true,
	}

	fmt.Println("Creating assignment...")
	var createdResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    map[string]interface{} `json:"result"`
	}
	if err := postJSON(baseURL+"/create", createData, &createdResp); err != nil {
		panic(err)
	}
	fmt.Printf("Created: %+v\n", createdResp.Result)

	// ID อาจมาเป็น float64 หรือ string จาก JSON
	idFloat, ok := createdResp.Result["ID"].(float64)
	if !ok {
		panic("cannot parse created ID")
	}
	id := strconv.Itoa(int(idFloat))

	fmt.Println("\nGetting all assignments...")
	var allResp struct {
		IsSuccess bool                     `json:"isSuccess"`
		Result    []map[string]interface{} `json:"result"`
	}
	if err := getJSON(baseURL+"/getAll", &allResp); err != nil {
		panic(err)
	}
	fmt.Printf("All assignments: %+v\n", allResp.Result)

	fmt.Printf("\nGetting assignment by ID %s...\n", id)
	var singleResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    map[string]interface{} `json:"result"`
	}
	if err := getJSON(baseURL+"/get/"+id, &singleResp); err != nil {
		panic(err)
	}
	fmt.Printf("Assignment: %+v\n", singleResp.Result)


	updateData := map[string]interface{}{
		"ID":          int(idFloat), 
		"title":       "Updated Go Test Assignment",
		"description": "Updated description",
	}
	fmt.Printf("\nUpdating assignment ID %s...\n", id)
	var updatedResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    map[string]interface{} `json:"result"`
	}
	if err := postJSON(baseURL+"/update", updateData, &updatedResp); err != nil {
		panic(err)
	}
	fmt.Printf("Updated: %+v\n", updatedResp.Result)

	fmt.Printf("\nDeleting assignment ID %s...\n", id)
	var deletedResp struct {
		IsSuccess bool   `json:"isSuccess"`
		Result    string `json:"result"`
	}
	if err := getJSON(baseURL+"/delete/"+id, &deletedResp); err != nil {
		panic(err)
	}
	fmt.Printf("Deleted: %+v\n", deletedResp.Result)


	fmt.Println("\nGetting all assignments after deletion...")
	if err := getJSON(baseURL+"/getAll", &allResp); err != nil {
		panic(err)
	}
	fmt.Printf("All assignments after deletion: %+v\n", allResp.Result)
}

// Helper for GET requests
func getJSON(url string, target interface{}) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return json.NewDecoder(resp.Body).Decode(target)
}

// Helper for POST requests
func postJSON(url string, data interface{}, target interface{}) error {
	payload, _ := json.Marshal(data)
	resp, err := http.Post(url, "application/json", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("Response body:", string(body))
	return json.Unmarshal(body, target)
}
