package utils

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"
)

type Response struct {
	IsSuccess bool `json:"isSuccess"`
	Result    any  `json:"result"`
}

func RequestTest(t *testing.T, method, path string, data map[string]any) {
	t.Helper()

	URL := "http://localhost:8080"
	var buf *bytes.Reader
	if data != nil {
		body, err := json.Marshal(data)
		if err != nil {
			t.Fatal("failed to marshal data : ", err)
		}
		buf = bytes.NewReader(body)
	} else {
		buf = bytes.NewReader(nil)
	}

	req, err := http.NewRequest(method, URL+path, buf)
	if err != nil {
		t.Fatal("failed to create new request : ", err)
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal("failed to request : ", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	var finalResp Response
	if err := json.Unmarshal(bodyBytes, &finalResp); err != nil {
		t.Fatalf("expected JSON but got: %s", string(bodyBytes))
	}

	if !(finalResp.IsSuccess) {
		t.Fatalf("request failed: %+v", finalResp)
	}

	t.Log("result : ", finalResp.Result)
}
