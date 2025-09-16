package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
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

func (controller *ApplicantController) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "ApplicantCreate.tpl")

	rendered := mustache.RenderFile(path, map[string]any{
		"title":   "Create Applicant",
		"RootURL": controller.application.RootURL,
	})

	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (controller *ApplicantController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateApplicantForm",
		Handler: controller.RenderCreateForm,
		Method:  core.GET,
	})

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

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetApplicantsFromFile",
		Handler: controller.GetApplicantsFromFile,
		Method:  core.GET,
	})

	return routeList
}

func (controller *ApplicantController) CreateApplicant(c *fiber.Ctx) error {
	applicant := new(model.Applicant)
	if err := c.BodyParser(applicant); err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(applicant).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: applicant,
	})
}

func (controller *ApplicantController) GetAllApplicants(c *fiber.Ctx) error {
	var applicants []*model.Applicant
	if err := controller.application.DB.Find(&applicants).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: applicants,
	})
}

func (controller *ApplicantController) GetApplicantByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var applicant model.Applicant
	if err := controller.application.DB.First(&applicant, id).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusNotFound, Message: "Applicant not found",
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: applicant,
	})
}

func (controller *ApplicantController) UpdateApplicant(c *fiber.Ctx) error {
	applicant := new(model.Applicant)
	if err := c.BodyParser(applicant); err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Cannot parse JSON",
		})
	}

	var existing model.Applicant
	if err := controller.application.DB.First(&existing, applicant.ID).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusNotFound, Message: "Applicant not found",
		})
	}

	if err := controller.application.DB.Save(applicant).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: applicant,
	})
}

func (controller *ApplicantController) DeleteApplicant(c *fiber.Ctx) error {
	var payload struct {
		ID uint `json:"id"`
	}
	if err := c.BodyParser(&payload); err != nil || payload.ID == 0 {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Invalid ID",
		})
	}

	if err := controller.application.DB.Where("id = ?", payload.ID).Delete(&model.Applicant{}).Error; err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Message: "Delete successful",
	})
}

func (controller *ApplicantController) ReadApplicantsFromFile(filePath string) ([]*model.Applicant, error) {
	mapper, err := core.CreateMapper[model.Applicant](filePath)
	if err != nil {
		return nil, err
	}
	return mapper.Deserialize(), nil
}

func (controller *ApplicantController) GetApplicantsFromFile(c *fiber.Ctx) error {
	filePath := c.Query("path")
	if filePath == "" {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "File path is required",
		})
	}

	applicants, err := controller.ReadApplicantsFromFile(filePath)
	if err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(c, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: applicants,
	})
}
