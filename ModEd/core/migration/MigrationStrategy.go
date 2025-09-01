package migration

// Wrote By : MEP-0001

type SeedPath struct {
	Path  string
	Model interface{}
}

type MigrationStrategy interface {
	GetModels() []interface{}
	GetSeedPath() []SeedPath
}
