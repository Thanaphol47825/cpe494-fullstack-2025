package main

import (
	"ModEd/common"
	"ModEd/core"
	"ModEd/core/database"
	"ModEd/core/migration"
	"ModEd/curriculum"
	"ModEd/eval"
	"ModEd/hr"
	"ModEd/project"
	"ModEd/recruit"
	"flag"
	"fmt"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	db, err := database.ConnectPostgres()
	if err != nil {
		panic(err)
	}

	optionFlag := flag.String("option", "nothing here", "Reset database")

	flag.Parse()

	migrationManager := migration.NewMigrationManager(db)

	switch *optionFlag {
	case "reset":
		fmt.Println("Reset database and load seed data")
		err = migrationManager.ResetAndLoadDB()
	case "blank":
		fmt.Println("Reset database without loading seed data")
		err = migrationManager.ResetDB()
	default:
		fmt.Println("No option selected, running application only")
	}

	if err != nil {
		panic(err)
	}

	application := core.GetApplication()
	common.InitialCommon()
	curriculum.InitialCurriculum()
	project.InitialProject()
	hr.InitialCommon()
	eval.InitialEval()
	recruit.InitialRecruit()
	application.Run()
}
