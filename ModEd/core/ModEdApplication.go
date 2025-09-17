package core

import (
	"ModEd/core/config"
	"ModEd/core/database"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type ModEdApplication struct {
	Configuration config.EnvConfiguration
	Application   *fiber.App
	port          int
	RootPath      string
	RootURL       string
	DB            *gorm.DB
}

func (application *ModEdApplication) Run() {
	application.Application.Listen(fmt.Sprintf(":%d", application.port))
}

func (application *ModEdApplication) AddController(controller BaseController) {
	routeList := controller.GetRoute()
	controller.SetApplication(application)
	for _, route := range routeList {
		switch route.Method {
		case GET:
			application.Application.Get(route.Route, route.Handler)
		case POST:
			application.Application.Post(route.Route, route.Handler)
		}
	}
}

func (application *ModEdApplication) loadConfig() {
	application.Configuration = config.LoadConfig()
	if RootPath, err := os.Getwd(); err == nil {
		application.RootPath = filepath.Clean(RootPath)
	} else {
		panic(err)
	}
	application.RootURL = fmt.Sprintf("%s:%d", application.Configuration.App.Domain, application.Configuration.App.Port)
	application.port = application.Configuration.App.Port
}

func (application *ModEdApplication) setConfigStaticServe() {
	// Automatically find all subfolders named 'static' and serve their contents
	filepath.Walk(application.RootPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() && info.Name() == "static" {
			parent := filepath.Base(filepath.Dir(path))
			// Serve at /<parent>/static
			urlPath := "/" + parent + "/static"
			application.Application.Static(urlPath, path)
		}
		return nil
	})
}

func (application *ModEdApplication) setSPAServe() {
	application.Application.Get("/", func(context *fiber.Ctx) error {
		path := filepath.Join(application.RootPath, "core", "view", "Main.tpl")
		tmpl, _ := mustache.ParseFile(path)

		file, err := os.ReadFile(filepath.Join(application.RootPath, "modules.json"))
		if err != nil {
			log.Fatalf("Error reading modules.json: %v", err)
		}

		var moduleList []struct {
			Label     string `json:"label"`
			ClassName string `json:"className"`
			Script    string `json:"script"`
		}
		if err := json.Unmarshal(file, &moduleList); err != nil {
			log.Fatalf("Error unmarshalling modules.json: %v", err)
		}
		modulesJSON, err := json.Marshal(moduleList)
		if err != nil {
			log.Fatal(err)
		}

		rendered := tmpl.Render(map[string]any{
			"title":   "ModEd",
			"RootURL": application.RootURL,
			"modules": string(modulesJSON),
		})
		context.Set("Content-Type", "text/html; charset=utf-8")
		return context.SendString(rendered)
	})
}

// NOTE: Singleton
var application *ModEdApplication

func GetApplication() *ModEdApplication {
	if application == nil {
		application = &ModEdApplication{
			Application: fiber.New(),
		}
		application.Application.Use(logger.New(logger.Config{
			Format: "${time} | Method: ${method} | Path: ${path} | status: ${status}\n",
		}))

		application.loadConfig()
		application.setConfigStaticServe()
		application.setSPAServe()

		db, err := database.ConnectPostgres(application.Configuration.Database.Dsn)
		if err != nil {
			panic(err)
		}
		application.DB = db
	}
	return application
}
