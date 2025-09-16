package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

const RootPath = "/Users/kittipongpiyawanno/Projects/cpe494-fullstack-2025/example/template"
const RootURL = "http://localhost:3000/"

func main() {
	app := fiber.New()

	app.Static("/static", "./static")

	app.Get("/", func(context *fiber.Ctx) error {
		path := filepath.Join(RootPath, "view", "Main.tpl")
		template, _ := mustache.ParseFile(path)
		rendered := template.Render(map[string]string{
			"title":   "ModEd BackOffice",
			"RootURL": RootURL,
		})
		context.Set("Content-Type", "text/html")
		return context.SendString(rendered)
	})

	app.Get("/template", func(context *fiber.Ctx) error {
		directory := filepath.Join(RootPath, "view", "input")
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

	app.Listen(":3000")
}
