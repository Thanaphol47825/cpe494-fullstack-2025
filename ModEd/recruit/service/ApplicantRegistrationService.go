package service

import (
	commonModel "ModEd/common/model"
	"ModEd/recruit/model"
	"fmt"

	"gorm.io/gorm"
)

type ApplicantRegistrationService struct {
	DB *gorm.DB
}

func NewApplicantRegistrationService(db *gorm.DB) *ApplicantRegistrationService {
	return &ApplicantRegistrationService{
		DB: db,
	}
}

func (s *ApplicantRegistrationService) RegisterApplicant(
	applicant *model.Applicant,
	roundID uint,
	facultyID uint,
	departmentID uint,
	program commonModel.ProgramType,
) (*model.ApplicationReport, error) {
	if err := s.DB.Create(applicant).Error; err != nil {
		return nil, fmt.Errorf("failed to create applicant: %w", err)
	}

	var round model.ApplicationRound
	if err := s.DB.First(&round, roundID).Error; err != nil {
		return nil, fmt.Errorf("failed to get application round: %w", err)
	}

	status := model.Pending
	eligible, err := CheckApplicantEligibility(*applicant, round.RoundName)
	if err != nil {
		status = model.Pending
	} else if !eligible {
		status = model.Rejected
	}

	report := &model.ApplicationReport{
		ApplicantID:         applicant.ID,
		ApplicationRoundsID: roundID,
		FacultyID:           facultyID,
		DepartmentID:        departmentID,
		Program:             program,
		ApplicationStatuses: string(status),
	}

	if err := s.DB.Create(report).Error; err != nil {
		return nil, fmt.Errorf("failed to create application report: %w", err)
	}

	return report, nil
}
