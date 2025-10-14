// MEP-1003 Student Recruitment
package model

import (
	"ModEd/common/model"
	"ModEd/core"
	"encoding/json"
	"time"
)

type Interview struct {
	core.BaseModel
	InstructorID         uint               `json:"instructor_id" gorm:"not null" form:"label:Instructor;type:select;fk:Instructor;fkApi:common/instructors/getall;fkDisplay:first_name,last_name"`
	Instructor           *model.Instructor  `gorm:"foreignKey:InstructorID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" form:"-"`
	ApplicationReportID  uint               `json:"application_report_id" gorm:"not null" form:"label:Application Report;type:select;fk:ApplicationReport;fkApi:/recruit/GetApplicationReports;fkDisplay:String()"`
	ApplicationReport    *ApplicationReport `gorm:"foreignKey:ApplicationReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" form:"-"`
	ScheduledAppointment time.Time          `json:"scheduled_appointment" form:"label:Scheduled Appointment;type:datetime-local"`
	CriteriaScores       string             `json:"criteria_scores" form:"label:Criteria Scores (JSON);type:textarea;placeholder:{\"communication\": 8.5, \"technical\": 9.0}"`
	TotalScore           float64            `json:"total_score" form:"label:Total Score;type:number;step:0.1"`
	EvaluatedAt          time.Time          `json:"evaluated_at" form:"label:Evaluated At;type:datetime-local"`
	InterviewStatus      ApplicationStatus  `json:"interview_status" gorm:"type:varchar(20)" form:"label:Interview Status;type:select"`
}

func (i *Interview) SetCriteriaScores(scores map[string]float64) error {
	jsonData, err := json.Marshal(scores)
	if err != nil {
		return err
	}
	i.CriteriaScores = string(jsonData)
	return nil
}

func (i *Interview) GetCriteriaScores() (map[string]float64, error) {
	var scores map[string]float64
	err := json.Unmarshal([]byte(i.CriteriaScores), &scores)
	if err != nil {
		return nil, err
	}
	return scores, nil
}
