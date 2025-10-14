package model

import (
    "ModEd/core"
    "time"
)

type CoursePlan struct {
    core.BaseModel
    CourseId uint      `gorm:"not null" csv:"course_id" json:"CourseId" form:"label:Course;placeholder:Select Course;type:select;required:true;fk:Course;fklabel:Name"`
		Course   Course    `gorm:"foreignKey:CourseId;references:ID" form:"-"`
    Date        time.Time    `json:"Date" gorm:"not null;column:date" form:"label:Date;type:datetime-local;required:true"`
    Week        int          `json:"Week" gorm:"not null;column:week" form:"label:Week;type:number;required:true"`
    Topic       string       `json:"Topic" gorm:"type:varchar(255);column:topic" form:"label:Topic;type:text"`
    Description string       `json:"Description" gorm:"type:varchar(255);column:description" form:"label:Description;type:textarea"`
}

func (CoursePlan) TableName() string {
    return "course_plans"
}
