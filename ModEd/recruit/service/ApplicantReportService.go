package service

import (
	"ModEd/recruit/model"
	"fmt"
	"gorm.io/gorm"
)

type ApplicantReportService struct {
	DB *gorm.DB
}

func NewApplicantReportService(db *gorm.DB) *ApplicantReportService {
	return &ApplicantReportService{
		DB: db,
	}
}

func (s *ApplicantReportService) GetApplicationReportByApplicantID(applicantID uint) ([]*model.ApplicationReport, error) {
	var reports []*model.ApplicationReport
	if err := s.DB.
		Preload("Applicant").
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		Where("applicant_id = ?", applicantID).
		Find(&reports).Error; err != nil {
		return nil, fmt.Errorf("failed to get application reports: %w", err)
	}
	return reports, nil
}

func (s *ApplicantReportService) ConfirmAcceptance(applicationReportID uint) error {
	var report model.ApplicationReport
	if err := s.DB.First(&report, applicationReportID).Error; err != nil {
		return fmt.Errorf("application report not found: %w", err)
	}

	if string(report.ApplicationStatuses) != string(model.Accepted) {
		return fmt.Errorf("can only confirm reports with Accepted status, current status: %s", report.ApplicationStatuses)
	}

	if err := s.DB.Model(&report).Update("application_statuses", string(model.Confirmed)).Error; err != nil {
		return fmt.Errorf("failed to confirm acceptance: %w", err)
	}

	return nil
}

func (s *ApplicantReportService) VerifyApplicationEligibility(applicationReportID uint) error {
	var report model.ApplicationReport
	if err := s.DB.
		Preload("Applicant").
		Preload("ApplicationRound").
		First(&report, applicationReportID).Error; err != nil {
		return fmt.Errorf("application report not found: %w", err)
	}

	eligible, err := CheckApplicantEligibility(report.Applicant, report.ApplicationRound.RoundName)
	if err != nil {
		return fmt.Errorf("failed to check eligibility: %w", err)
	}

	newStatus := string(model.Pending)
	if !eligible {
		newStatus = string(model.Rejected)
	}

	if string(report.ApplicationStatuses) == string(model.Pending) || report.ApplicationStatuses == "" {
		if err := s.DB.Model(&report).Update("application_statuses", newStatus).Error; err != nil {
			return fmt.Errorf("failed to update status: %w", err)
		}
	}

	return nil
}

