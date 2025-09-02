package core

import (
	"ModEd/core/database"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ModEdApplication struct {
	Application *fiber.App
	port        int
	RootPath    string
	RootURL     string
	DB          *gorm.DB
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
	application.port = 8080
	application.RootPath = "/workspace"
}

// NOTE: Singleton
var application *ModEdApplication

func GetApplication() *ModEdApplication {
	if application == nil {
		application = &ModEdApplication{
			Application: fiber.New(),
		}
		application.loadConfig()

		db, err := database.ConnectPostgres()
		if err != nil {
			panic(err)
		}
		application.DB = db
	}
	return application
}
