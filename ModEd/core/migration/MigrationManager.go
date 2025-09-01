package migration

// Wrote By : MEP-0001

import (
	"ModEd/utils/deserializer"
	"fmt"

	"gorm.io/gorm"
)

type MigrationManager struct {
	DB                   *gorm.DB
	models               []interface{}
	seedPaths            []SeedPath
	migrationStrategyMap map[ModuleOptionEnum]MigrationStrategy
}

func NewMigrationManager(DB *gorm.DB) *MigrationManager {
	migrationMap := make(map[ModuleOptionEnum]MigrationStrategy)

	// Register migration strategies for each module
	migrationMap[MODULE_COMMON] = &CommonMigrationStrategy{}
	migrationMap[MODULE_RECRUIT] = &RecuitMigrationStrategy{}
	migrationMap[MODULE_CURRICULUM] = &CurriculumMigrationStrategy{}
	migrationMap[MODULE_EVAL] = &EvalMigrationStrategy{}

	// Initialize models and seed paths array
	var seedPaths []SeedPath
	models := []interface{}{}

	// Process all registered modules
	for module := range migrationMap {
		if strategy := migrationMap[module]; strategy != nil {
			// Collect all models for migration
			models = append(models, strategy.GetModels()...)

			// Collect seed paths for each module
			seedPaths = append(seedPaths, strategy.GetSeedPath()...)
		}
	}

	return &MigrationManager{
		DB:                   DB,
		migrationStrategyMap: migrationMap,
		models:               models,
		seedPaths:            seedPaths,
	}
}

func (m *MigrationManager) migrateToDB() error {
	var modelsToMigrate []interface{}
	for i := range m.models {
		if m.DB.Migrator().HasTable(m.models[i]) {
			continue
		}

		modelsToMigrate = append(modelsToMigrate, m.models[i])
	}
	fmt.Printf("Migrating %d new models to the database...\n", len(modelsToMigrate))

	if err := m.DB.AutoMigrate(modelsToMigrate...); err != nil {
		return fmt.Errorf("failed to migrate to db: %w", err)
	}
	return nil
}

func (m *MigrationManager) DropAllTables() error {
	if m.DB == nil {
		return fmt.Errorf("database connection is nil")
	}

	err := m.DB.Migrator().DropTable(m.models...)
	if err != nil {
		return fmt.Errorf("failed to drop tables: %w", err)
	}
	return nil
}

func (m *MigrationManager) LoadSeedData() error {
	for _, seedPath := range m.seedPaths {
		fd, err := deserializer.NewFileDeserializer(seedPath.Path)
		if err != nil {
			fmt.Printf("Error creating deserializer for %s: %v\n", seedPath.Path, err)
			return err
		}

		err = fd.Deserialize(seedPath.Model)
		if err != nil {
			fmt.Printf("Error deserializing %s: %v\n", seedPath.Path, err)
			return err
		}

		result := m.DB.Create(seedPath.Model)
		if result.Error != nil {
			fmt.Printf("Error creating records from %s: %v\n", seedPath.Path, result.Error)
			return result.Error
		}
	}

	return nil
}

func (m *MigrationManager) ResetDB() error {
	err := m.DropAllTables()
	if err != nil {
		return err
	}
	err = m.migrateToDB()
	if err != nil {
		return err
	}
	return nil
}

func (m *MigrationManager) ResetAndLoadDB() error {
	err := m.ResetDB()
	if err != nil {
		return err
	}

	// Load seed data directly since paths are already initialized
	err = m.LoadSeedData()
	if err != nil {
		return err
	}

	return nil
}
