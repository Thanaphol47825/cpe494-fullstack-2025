package test

import (
	"testing"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const testDSN = "host= user=password= dbname= port= sslmode=disable"

func openTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(postgres.Open(testDSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test DB: %v", err)
	}
	return db
}

func truncateTable(t *testing.T, db *gorm.DB, table string) {
	t.Helper()
	if err := db.Exec(`TRUNCATE TABLE ` + table + ` RESTART IDENTITY CASCADE`).Error; err != nil {
		t.Fatalf("truncate %s: %v", table, err)
	}
}
