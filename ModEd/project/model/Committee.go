package model

import (
	"gorm.io/gorm"
)

type Committee struct {
    core.BaseModel
    Name string
    Email string

    // needs restructuring if we move this to be many to many format
    Projects []Project
}
