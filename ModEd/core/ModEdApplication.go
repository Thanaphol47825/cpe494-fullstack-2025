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
	application.Application.Static("/common/static", filepath.Join(application.RootPath, "common", "static"))
	application.Application.Static("/curriculum/static", filepath.Join(application.RootPath, "curriculum", "static"))
	application.Application.Static("/eval/static", filepath.Join(application.RootPath, "eval", "static"))
	application.Application.Static("/hr/static", filepath.Join(application.RootPath, "hr", "static"))
	application.Application.Static("/project/static", filepath.Join(application.RootPath, "project", "static"))
	application.Application.Static("/recruit/static", filepath.Join(application.RootPath, "recruit", "static"))
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
