package service

import (
	"ModEd/recruit/model"
	"fmt"
	"time"
	"gorm.io/gorm"
)

type InstructorEvaluateApplicantService struct {
	DB *gorm.DB
}

func NewInstructorEvaluateApplicantService(db *gorm.DB) *InstructorEvaluateApplicantService {
	return &InstructorEvaluateApplicantService{
		DB: db,
	}
}

func (s *InstructorEvaluateApplicantService) HasPermissionToEvaluate(instructorID uint, interviewID uint) (bool, error) {
	var interview model.Interview
	if err := s.DB.First(&interview, interviewID).Error; err != nil {
		return false, fmt.Errorf("interview not found: %w", err)
	}
	return interview.InstructorID == instructorID, nil
}

func (s *InstructorEvaluateApplicantService) DetermineInterviewStatus(
	applicationReportID uint,
	totalScore float64,
) (model.ApplicationStatus, error) {
	var report model.ApplicationReport
	if err := s.DB.
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		First(&report, applicationReportID).Error; err != nil {
		return "", fmt.Errorf("application report not found: %w", err)
	}

	var criteria model.InterviewCriteria
	if err := s.DB.
		Where("application_rounds_id = ? AND faculty_id = ? AND department_id = ?",
			report.ApplicationRoundsID,
			report.FacultyID,
			report.DepartmentID).
		First(&criteria).Error; err != nil {
		return model.Evaluated, nil
	}

	if totalScore >= criteria.PassingScore {
		return model.Accepted, nil
	}
	return model.Rejected, nil
}

func (s *InstructorEvaluateApplicantService) EvaluateApplicant(
	interviewID uint,
	instructorID uint,
	criteriaScores map[string]float64,
	totalScore float64,
) error {
	hasPermission, err := s.HasPermissionToEvaluate(instructorID, interviewID)
	if err != nil {
		return err
	}
	if !hasPermission {
		return fmt.Errorf("instructor does not have permission to evaluate this interview")
	}

	var interview model.Interview
	if err := s.DB.
		Preload("ApplicationReport").
		First(&interview, interviewID).Error; err != nil {
		return fmt.Errorf("interview not found: %w", err)
	}

	interview.SetCriteriaScores(criteriaScores)
	interview.TotalScore = totalScore
	interview.EvaluatedAt = time.Now()
	interview.InterviewStatus = model.Evaluated

	if err := s.DB.Save(&interview).Error; err != nil {
		return fmt.Errorf("failed to update interview: %w", err)
	}

	finalStatus, err := s.DetermineInterviewStatus(interview.ApplicationReportID, totalScore)
	if err != nil {
		return err
	}

	if err := s.DB.Model(&model.ApplicationReport{}).
		Where("id = ?", interview.ApplicationReportID).
		Update("application_statuses", string(finalStatus)).Error; err != nil {
		return fmt.Errorf("failed to update application report status: %w", err)
	}

	return nil
}

