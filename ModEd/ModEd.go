package main

import (
	"ModEd/common"
	"ModEd/core"
	"ModEd/core/database"
	"ModEd/core/migration"
	"ModEd/curriculum"
	"ModEd/eval"
	"ModEd/hr"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	db, err := database.ConnectPostgres()
	if err != nil {
		panic(err)
	}

	migrationManager := migration.NewMigrationManager(db)
	migrationManager.MigrateToDB()

	application := core.GetApplication()
	common.InitialCommon()
	curriculum.InitialCurriculum()
	//project.InitialProject()
	hr.InitialCommon()
	eval.InitialEval()
	application.Run()
}
