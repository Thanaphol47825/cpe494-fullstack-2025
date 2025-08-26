package model

import (
	"ModEd/core"
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
