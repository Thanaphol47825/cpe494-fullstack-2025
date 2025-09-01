# Core Migration Manager

This module provides a centralized way to handle database migrations and seed data using GORM (with Postgresql) for the ModEd system.

## Adding New Migration Strategies

To enable migrations for a new module:

1. Implement a MigrationStrategy for the module.
```go
package migration

// MEP-0069 Example

import (
	"ModEd/example/model"
)

type ExampleMigrationStrategy struct {
}

func (s *ExampleMigrationStrategy) GetModels() []interface{} {
	return []interface{}{
		&model.Example1{},
		&model.Example2{},
		&model.Example3{},
	}
}

// Required: Implement GetSeedPath to define seed data sources
func (s *ExampleMigrationStrategy) GetSeedPath() []SeedPath {
	return []SeedPath{
		{Path: "data/example/model1.json", Model: &[]model.Example1{}},
		{Path: "data/example/model2.json", Model: &[]model.Example2{}},
		{Path: "data/example/model3.json", Model: &[]model.Example3{}},
	}
}
```

2. Register it in `NewMigrationManager()`:

```go
migrationMap[MODULE_EXAMPLE] = &ExampleMigrationStrategy{}
```

## Get the MigrationManager Instance

Initialize with your database connection:

```go
db := // your gorm.DB instance
mgr := migration.NewMigrationManager(db)
```

## Build Database and Run Migrations

```go
// Reset database (drops and recreates tables)
err := mgr.ResetDB()
if err != nil {
    panic("Failed to reset DB: " + err.Error())
}
```

## Add Seed Data

Seed data is now automatically loaded from paths defined in GetSeedPath():

```go
// Load all seed data from registered paths
err := mgr.LoadSeedData()
if err != nil {
    panic("Failed to load seed data: " + err.Error())
}
```

##  Drop All Tables

```go
err = mgr.DropAllTables()
if err != nil {
    panic("Failed to drop tables: " + err.Error())
}
```

## Full Flow

```go
// Initialize with database connection
db := // your gorm.DB instance
mgr := migration.NewMigrationManager(db)

// Reset database and load all seed data
err := mgr.ResetAndLoadDB()
if err != nil {
    panic(err)
}
```
