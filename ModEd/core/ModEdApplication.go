package core

import (
	"ModEd/core/config"
	"ModEd/core/database"
	"fmt"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
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

		db, err := database.ConnectPostgres(application.Configuration.Database.Dsn)
		if err != nil {
			panic(err)
		}
		application.DB = db
	}
	return application
}
