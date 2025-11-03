package model

import (
    "ModEd/core"
    "time"
)

type CoursePlan struct {
    core.BaseModel
    CourseId    uint         `json:"CourseId" gorm:"not null;column:course_id" form:"label:Course;type:select;fk:Course;required:true"`
    Course      Course       `json:"Course" gorm:"foreignKey:CourseId;references:ID" form:"-"`
    Date        time.Time    `json:"Date" gorm:"not null;column:date" form:"label:Date;type:datetime-local;required:true"`
    Week        int          `json:"Week" gorm:"not null;column:week" form:"label:Week;type:number;required:true"`
    Topic       string       `json:"Topic" gorm:"type:varchar(255);column:topic" form:"label:Topic;type:text"`
    Description string       `json:"Description" gorm:"type:varchar(255);column:description" form:"label:Description;type:textarea"`
}

func (CoursePlan) TableName() string {
	return "course_plans"
}
