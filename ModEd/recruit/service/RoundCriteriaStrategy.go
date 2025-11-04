package service

import (
	roundCriteria "ModEd/recruit/controller/RoundCriteria"
	"ModEd/recruit/model"
	"fmt"
)

type RoundCriteriaChecker interface {
	IsSatisfiedBy(applicant model.Applicant) bool
}

func GetCriteriaByRoundName(roundName string) (RoundCriteriaChecker, error) {
	switch roundName {
	case "Portfolio":
		return &roundCriteria.PortfolioCriteria{}, nil
	case "Quota":
		return &roundCriteria.QuotaCriteria{}, nil
	case "Admission":
		return &roundCriteria.AdmissionCriteria{}, nil
	case "Scholarship":
		return &roundCriteria.ScholarshipCriteria{}, nil
	default:
		return nil, fmt.Errorf("unknown round name: %s", roundName)
	}
}

func CheckApplicantEligibility(applicant model.Applicant, roundName string) (bool, error) {
	criteria, err := GetCriteriaByRoundName(roundName)
	if err != nil {
		return false, err
	}
	return criteria.IsSatisfiedBy(applicant), nil
}
