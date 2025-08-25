package model

import (
	"gorm.io/gorm"
)


type Advisor struct {
    core.BaseModel
    Name string
    Email string
}
