// Kritsanaphong Thaworana 65070503403
package model

import (
    "ModEd/core"
    
)

//  SeniorProject represents the senior project table in the database

type SeniorProject struct{
    core.BaseModel // ID, CreatedAt, UpdatedAt, DeletedAt

    // Field from csv
    GroupName string                `gorm:"size:255;not null" json:"GroupName" csv:"GroupName"`

    // Advisor (1:1 via FK)
    AdvisorAjarn Advisor            `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
    
    //  Relationships (From OOAD)
    // Keep 1:N only if the child models have ProjectID
    Members []GroupMember           `gorm:"foreignKey:ProjectId"` 
    Committees []Committee          `gorm:"foreignKey:ProjectId"` // 1:N (should be M:N technically)
    Assignments []Assignment        `gorm:"foreignKey:ProjectId"` 
    Presentations []Presentation    `gorm:"foreignKey:ProjectId"` 
    Report []Report                 `gorm:"foreignKey:ProjectId"` 
    
    // Assessment (1:1). In Assessment model, set: ProjectID uint `gorm:"uniqueIndex"`
    Assessment *Assessment          `gorm:"foreignKey:ProjectId"` // 1:1
    
}

// Require by app
func (p SeniorProject) GetID() uint {
	return p.ID
}

// Require by gorm
func (p SeniorProject) GetTableName() string {
    return "SeniorProjects"
}