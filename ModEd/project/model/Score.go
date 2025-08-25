package model

import (
	"gorm.io/gorm"
)

type Score struct {
    core.BaseModel
    Value       int
    CriteriaID  uint
    Criteria    AssessmentCriteria

    // Relationships
    AdvisorID     *uint
    CommitteeID   *uint
    AssignmentID  *uint
    PresentationID *uint
    ReportID      *uint
    AssessmentID  *uint
}
