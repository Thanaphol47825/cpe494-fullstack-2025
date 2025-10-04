package model

type UserRole struct {
	UserID string `gorm:"primaryKey;not null;index"`
	Role   string `gorm:"primaryKey;not null"`
}
