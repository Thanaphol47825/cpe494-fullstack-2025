package model

import (
	"gorm.io/gorm"
)

type AssessmentCriteria struct {
    core.BaseModel

    Name        string
    Description string
    MaxScore    int
}
