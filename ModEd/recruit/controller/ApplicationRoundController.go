package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"net/http"
	"path/filepath"
	"os"
	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type ApplicationRoundController struct {
	application *core.ModEdApplication
}

func NewApplicationRoundController() *ApplicationRoundController {
	return &ApplicationRoundController{}
}

func (controller *ApplicationRoundController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{
		{
			Path:  "ApplicationRound",
			Model: &model.ApplicationRound{},
		},
	}
	return modelMetaList
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

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/ImportApplicationRoundsFromFile",
		Handler: controller.ImportApplicationRoundsFromFile,
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

func (controller *ApplicationRoundController) ReadApplicationRoundsFromFile(filePath string) ([]*model.ApplicationRound, error) {
	mapper, err := core.CreateMapper[model.ApplicationRound](filePath)
	if err != nil {
		return nil, err
	}
	return mapper.Deserialize(), nil
}

func (controller *ApplicationRoundController) ImportApplicationRoundsFromFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil || file == nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Missing file",
		})
	}

	tmpDir := os.TempDir()
	tmpPath := filepath.Join(tmpDir, file.Filename)
	if err := c.SaveFile(file, tmpPath); err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: "Cannot save uploaded file",
		})
	}
	defer os.Remove(tmpPath)

	rounds, parseErr := controller.ReadApplicationRoundsFromFile(tmpPath)
	if parseErr != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: parseErr.Error(),
		})
	}

	if len(rounds) > 0 {
		if err := controller.application.DB.Create(&rounds).Error; err != nil {
			return core.SendResponse(c, core.BaseApiResponse{
				IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
			})
		}
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: rounds,
	})
}