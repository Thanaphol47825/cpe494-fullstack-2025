package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
)

type ApplicantController struct {
	application *core.ModEdApplication
}

func NewApplicantController() *ApplicantController {
	return &ApplicantController{}
}

func (controller *ApplicantController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *ApplicantController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateApplicant",
		Handler: controller.CreateApplicant,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicants",
		Handler: controller.GetAllApplicants,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicant/:id",
		Handler: controller.GetApplicantByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteApplicant",
		Handler: controller.DeleteApplicant,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/UpdateApplicant",
		Handler: controller.UpdateApplicant,
		Method:  core.POST,
	})

	return routeList
}

func (controller *ApplicantController) CreateApplicant(context *fiber.Ctx) error {
	applicant := new(model.Applicant)

	if err := context.BodyParser(applicant); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(applicant).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    applicant,
	})
}

func (controller *ApplicantController) GetAllApplicants(context *fiber.Ctx) error {
	var applicants []*model.Applicant

	if err := controller.application.DB.Find(&applicants).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    applicants,
	})
}

func (controller *ApplicantController) GetApplicantByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var applicant model.Applicant

	if err := controller.application.DB.First(&applicant, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Applicant not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    applicant,
	})
}

func (controller *ApplicantController) UpdateApplicant(context *fiber.Ctx) error {
	applicant := new(model.Applicant)

	if err := context.BodyParser(applicant); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	var existing model.Applicant
	if err := controller.application.DB.First(&existing, applicant.ID).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Applicant not found",
		})
	}

	if err := controller.application.DB.Save(applicant).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    applicant,
	})
}

func (controller *ApplicantController) DeleteApplicant(c *fiber.Ctx) error {
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
		Delete(&model.Applicant{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result": "Delete successful",
	})
}

func (controller *ApplicantController) ReadApplicantsFromFile(filePath string) ([]*model.Applicant, error) {
	mapper, err := core.CreateMapper[model.Applicant](filePath)
	if err != nil {
		return nil, err
	}

	applicants := mapper.Deserialize()
	return applicants, nil
}
