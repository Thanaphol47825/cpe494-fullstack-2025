package core

import (
	"ModEd/core/config"
	"ModEd/core/database"
	demo "ModEd/core/demo/model"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/hoisie/mustache"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type ModEdApplication struct {
	Configuration          config.EnvConfiguration
	Application            *fiber.App
	SessionManager         *SessionManager
	RoleBasedAccessControl *RoleBasedAccessControl
	port                   int
	RootPath               string
	RootURL                string
	DB                     *gorm.DB
	Redis                  *redis.Client
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
			application.Application.Get(route.Route, application.RoleBasedAccessControl.RBACMiddleware(route.Middleware), route.Handler)
		case POST:
			application.Application.Post(route.Route, application.RoleBasedAccessControl.RBACMiddleware(route.Middleware), route.Handler)
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

		moduleList := application.DiscoverModules()
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

func (application *ModEdApplication) DiscoverModules() []struct {
	Label     string `json:"label"`
	ClassName string `json:"className"`
	Script    string `json:"script"`
	BaseRoute string `json:"baseRoute"`
} {
	var moduleList []struct {
		Label     string `json:"label"`
		ClassName string `json:"className"`
		Script    string `json:"script"`
		BaseRoute string `json:"baseRoute"`
	}

	// Walk through the ModEd directory to find modules-config.json files
	err := filepath.Walk(application.RootPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Look for modules-config.json files
		if !info.IsDir() && (info.Name() == "modules-config.json" || strings.HasSuffix(info.Name(), "-modules-config.json")) {
			file, err := os.ReadFile(path)
			if err != nil {
				log.Printf("Error reading %s: %v", path, err)
				return nil
			}

			var module struct {
				Label     string `json:"label"`
				ClassName string `json:"className"`
				Script    string `json:"script"`
				BaseRoute string `json:"baseRoute"`
			}

			if err := json.Unmarshal(file, &module); err != nil {
				log.Printf("Error unmarshalling %s: %v", path, err)
				return nil
			}

			moduleList = append(moduleList, module)
		}
		return nil
	})

	if err != nil {
		log.Printf("Error discovering modules: %v", err)
	}

	return moduleList
}

func (application *ModEdApplication) setExportTemplate() {
	application.Application.Get("/template", func(context *fiber.Ctx) error {
		directory := filepath.Join(application.RootPath, "core", "view", "client")
		entries, err := os.ReadDir(directory)
		if err != nil {
			log.Fatalf("Failed to read directory: %v", err)
		}

		template := fiber.Map{}
		for _, entry := range entries {
			path := filepath.Join(directory, entry.Name())
			content, err := os.ReadFile(path)
			if err != nil {
				log.Fatalf("Error reading file: %v", err)
			}
			name := entry.Name()
			template[name[0:len(name)-4]] = string(content)
		}
		return context.JSON(template)
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
		application.setExportTemplate()

		application.SetAPIform("field", demo.Field{})

		db, err := database.ConnectPostgres(application.Configuration.Database.Dsn)
		if err != nil {
			panic(err)
		}
		application.DB = db

		redis, err := database.NewRedis(application.Configuration.Redis)
		if err != nil {
			panic(err)
		}
		application.Redis = redis
		application.SessionManager = NewSessionManager(application.Redis, time.Duration(application.Configuration.TimeToLive.Session)*time.Second)
		application.RoleBasedAccessControl = NewRoleBasedAccessControl(application.DB, application.SessionManager)
	}
	return application
}
