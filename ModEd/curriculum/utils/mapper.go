package utils

import (
	"encoding/json"
	"errors"
	"os"
)

type JSONMapper[T any] struct {
	Path string
}

type DataMapper[T any] interface {
	Deserialize() []*T
	Serialize(data []*T) error
}

func CreateMapper[T any](path string) (DataMapper[T], error) {
	length := len(path)
	if path[length-5:length] == ".json" {
		mapper := &JSONMapper[T]{Path: path}
		return mapper, nil
	} else {
		return nil, errors.New("not supported file extension")
	}
}

func (mapper *JSONMapper[T]) Deserialize() []*T {
	file, err := os.OpenFile(mapper.Path, os.O_RDWR|os.O_CREATE, os.ModePerm)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	result := []*T{}
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&result); err != nil {
		panic(err)
	}
	return result
}

func (mapper *JSONMapper[T]) Serialize(data []*T) error {
	file, err := os.OpenFile(mapper.Path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, os.ModePerm)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	err = encoder.Encode(data)
	if err != nil {
		return err
	}
	return nil
}
