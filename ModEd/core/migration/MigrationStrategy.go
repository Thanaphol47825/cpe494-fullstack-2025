package migration

// Wrote By : MEP-1010, MEP-1012

type SeedPath struct {
	Path  string
	Model interface{}
}

type MigrationStrategy interface {
	GetModels() []interface{}
	GetSeedPath() []SeedPath
}
