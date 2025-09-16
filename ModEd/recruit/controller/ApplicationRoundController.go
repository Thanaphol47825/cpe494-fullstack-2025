package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"net/http"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type ApplicationRoundController struct {
	application *core.ModEdApplication
}

func NewApplicationRoundController() *ApplicationRoundController {
	return &ApplicationRoundController{}
}

func (controller *ApplicationRoundController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (ctl *ApplicationRoundController) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(ctl.application.RootPath, "recruit", "view", "ApplicationRoundCreate.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Create Application Round",
		"RootURL": ctl.application.RootURL,
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (controller *ApplicationRoundController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateApplicationRound",
		Handler: controller.CreateApplicationRound,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/RenderApplicationRoundForm",
		Handler: controller.RenderCreateForm,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicationRounds",
		Handler: controller.GetAllApplicationRounds,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicationRound/:id",
		Handler: controller.GetApplicationRoundByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteApplicationRound",
		Handler: controller.DeleteApplicationRound,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/UpdateApplicationRound",
		Handler: controller.UpdateApplicationRound,
		Method:  core.POST,
	})

	return routeList
}

func (controller *ApplicationRoundController) CreateApplicationRound(context *fiber.Ctx) error {
	round := new(model.ApplicationRound)

	if err := context.BodyParser(round); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(round).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    round,
	})
}

func (controller *ApplicationRoundController) GetAllApplicationRounds(context *fiber.Ctx) error {
	var rounds []*model.ApplicationRound

	if err := controller.application.DB.Find(&rounds).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    rounds,
	})
}

func (controller *ApplicationRoundController) GetApplicationRoundByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var round model.ApplicationRound

	if err := controller.application.DB.First(&round, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "ApplicationRound not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    round,
	})
}

func (controller *ApplicationRoundController) UpdateApplicationRound(context *fiber.Ctx) error {
	round := new(model.ApplicationRound)

	if err := context.BodyParser(round); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(round).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    round,
	})
}

func (controller *ApplicationRoundController) DeleteApplicationRound(c *fiber.Ctx) error {
	var payload struct {
		ID uint `json:"id"`
	}

	if err := c.BodyParser(&payload); err != nil || payload.ID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := controller.application.DB.
		Where("id = ?", payload.ID).
		Delete(&model.ApplicationRound{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Delete successful",
	})
}
