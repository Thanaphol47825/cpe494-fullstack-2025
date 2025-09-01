package migration

import (
	"ModEd/utils/deserializer"
	"fmt"

	"errors"

	"gorm.io/gorm"
)

type MigrationManager struct {
	DB                   *gorm.DB
	models               []interface{}
	seedDatas            map[string]interface{}
	migrationStrategyMap map[ModuleOptionEnum]MigrationStrategy
}

func NewMigrationManager(DB *gorm.DB) *MigrationManager {
	migrationMap := make(map[ModuleOptionEnum]MigrationStrategy)

	// To use the core migration module you need to create your own migration strategy
	// Then come here to replace `nil` with your model here to register
	migrationMap[MODULE_COMMON] = &CommonMigrationStrategy{}
	migrationMap[MODULE_RECRUIT] = &RecuitMigrationStrategy{}
	migrationMap[MODULE_CURRICULUM] = &CurriculumMigrationStrategy{}
	migrationMap[MODULE_EVAL] = &EvalMigrationStrategy{}
	seedDataMap := make(map[string]interface{})
	models := []interface{}{}
	// Migrate all modules at once
	for module := range migrationMap {
		if migrationMap[module] != nil {
			models = append(models, migrationMap[module].GetModels()...)
		}
	}

	return &MigrationManager{
		DB:                   DB,
		migrationStrategyMap: migrationMap,
		models:               models,
		seedDatas:            seedDataMap,
	}
}

func (m *MigrationManager) MigrateToDB() error {
	var modelsToMigrate []interface{}
	for i := range m.models {
		if m.DB.Migrator().HasTable(m.models[i]) {
			continue
		}

		modelsToMigrate = append(modelsToMigrate, m.models[i])
	}

	if err := m.DB.AutoMigrate(modelsToMigrate...); err != nil {
		return fmt.Errorf("failed to migrate to db: %w", err)
	}
	return nil
}

func (m *MigrationManager) DropAllTables() error {

	if m.DB == nil {
		return errors.New("db not initialize")
	}

	err := m.DB.Migrator().DropTable(m.models...)
	if err != nil {
		return err
	}
	return nil
}

func (m *MigrationManager) LoadSeedData() error {
	for path, md := range m.seedDatas {
		fmt.Println("Loading seed data from path:", path)

		fd, err := deserializer.NewFileDeserializer(path)
		if err != nil {
			fmt.Printf("Error creating deserializer for %s: %v\n", path, err)
			return err
		}

		fmt.Printf("FileDeserializer: %+v\n", fd)

		err = fd.Deserialize(md)
		if err != nil {
			fmt.Printf("Error deserializing %s: %v\n", path, err)
			return err
		}

		fmt.Printf("Deserialized data for %s: %+v\n", path, md)

		result := m.DB.Create(md)
		if result.Error != nil {
			fmt.Printf("Error creating records from %s: %v\n", path, result.Error)
			return result.Error
		}

		fmt.Printf("Successfully loaded data from %s: %d rows affected\n", path, result.RowsAffected)
	}

	return nil
}

func (m *MigrationManager) AddSeedData(path string, model interface{}) *MigrationManager {
	m.seedDatas[path] = model

	return m
}

func (m *MigrationManager) ResetDB() error {
	err := m.DropAllTables()
	if err != nil {
		return err
	}

	err = m.MigrateToDB()
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

	err = m.
		// AddSeedData("data/asset/Category.csv", &[]model.Category{}).
		// AddSeedData("data/asset/BorrowInstrument.csv", &[]model.BorrowInstrument{}).
		// AddSeedData("data/asset/InstrumentList.csv", &[]model.Instrument{}).
		// AddSeedData("data/asset/InstrumentLog.csv", &[]model.InstrumentLog{}).
		// AddSeedData("data/asset/SupplyList.csv", &[]model.Supply{}).
		// AddSeedData("data/asset/SupplyLog.csv", &[]model.SupplyLog{}).
		LoadSeedData()
	if err != nil {
		return err
	}

	return nil
}
