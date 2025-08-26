package deserializer

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/gocarina/gocsv"
)

type FileDeserializer struct {
	Path string
}

func NewFileDeserializer(path string) (*FileDeserializer, error) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, fmt.Errorf("file does not exist: %s: %w", path, err)
	}
	return &FileDeserializer{Path: path}, nil
}

func (d *FileDeserializer) Deserialize(data interface{}) error {
	ext := strings.ToLower(filepath.Ext(d.Path))
	switch ext {
	case ".csv":
		return d.DeserializeCSV(data)
	case ".json":
		return d.DeserializeJSON(data)
	default:
		return fmt.Errorf("unsupported file format: %s", ext)
	}
}

func (d *FileDeserializer) DeserializeCSV(data interface{}) error {
	file, err := os.OpenFile(d.Path, os.O_RDONLY, os.ModePerm)
	if err != nil {
		return fmt.Errorf("failed to open CSV file: %s: %w", d.Path, err)
	}
	defer file.Close()

	if err := gocsv.UnmarshalFile(file, data); err != nil {
		return fmt.Errorf("failed to unmarshal CSV file: %s: %w", d.Path, err)
	}

	return nil
}

func (d *FileDeserializer) DeserializeJSON(data interface{}) error {
	file, err := os.OpenFile(d.Path, os.O_RDONLY, os.ModePerm)
	if err != nil {
		return fmt.Errorf("failed to open JSON file: %s: %w", d.Path, err)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	if err := decoder.Decode(data); err != nil {
		return fmt.Errorf("failed to unmarshal JSON file: %s: %w", d.Path, err)
	}

	return nil
}
