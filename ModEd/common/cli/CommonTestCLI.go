package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

var ROOT_URL = "http://localhost:8080/"

func main() {
	values := map[string]string{
		"username": "kakashi",
		"password": "WeakPassword",
	}
	parameter, _ := json.Marshal(values)
	url := fmt.Sprintf("%sinfo", ROOT_URL)
	response, _ := http.Post(url, "application/json", bytes.NewBuffer(parameter))
	if response.StatusCode == http.StatusOK {
		buffer, _ := io.ReadAll(response.Body)
		fmt.Printf("%s\n", string(buffer))
	}
}
