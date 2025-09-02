# Mustache

## Example

```go
package controller

import (
	"ModEd/core"
	"fmt"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

func (controller *BackOfficeController) RenderMain(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "common", "view", "main.tpl")
	template, _ := mustache.ParseFile(path)
	rendered := template.Render(map[string]string{
		"title":   "ModEd BackOffice",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}
```
