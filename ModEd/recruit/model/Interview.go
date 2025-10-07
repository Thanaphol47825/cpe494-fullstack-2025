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
	InstructorID         uint               `json:"instructor_id" gorm:"not null"`
	Instructor           *model.Instructor  `gorm:"foreignKey:InstructorID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ApplicationReportID  uint               `json:"application_report_id" gorm:"not null"`
	ApplicationReport    *ApplicationReport `gorm:"foreignKey:ApplicationReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ScheduledAppointment time.Time          `json:"scheduled_appointment"`
	CriteriaScores       string             `json:"criteria_scores"`
	TotalScore           float64            `json:"total_score"`
	EvaluatedAt          time.Time          `json:"evaluated_at"`
	InterviewStatus      ApplicationStatus  `json:"interview_status" gorm:"type:varchar(20)"`
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
