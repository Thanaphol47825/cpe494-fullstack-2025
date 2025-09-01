package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
)

type AdminController struct {
	application *core.ModEdApplication
}

func NewAdminController() *AdminController {
	controller := &AdminController{}
	return controller
}

func (controller *AdminController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello Recruit Admins")
}

func (controller *AdminController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AdminController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/Admin",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateAdmin",
		Handler: controller.CreateAdmin,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetAllAdmin",
		Handler: controller.GetAllAdmin,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetAdmin/:id",
		Handler: controller.GetAdminByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteAdmin/:id",
		Handler: controller.DeleteAdmin,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/UpdateAdmi",
		Handler: controller.UpdateAdmin,
		Method:  core.POST,
	})

	return routeList
}

func (controller *AdminController) CreateAdmin(context *fiber.Ctx) error {
	admin := new(model.Admin)

	if err := context.BodyParser(admin); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(admin).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return context.Status(fiber.StatusCreated).JSON(admin)
}

func (controller *AdminController) GetAllAdmin(context *fiber.Ctx) error {
	var admins []*model.Admin

	if err := controller.application.DB.Find(&admins).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return context.JSON(admins)
}

func (controller *AdminController) GetAdminByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var admin model.Admin

	if err := controller.application.DB.First(&admin, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Admin not found",
		})
	}

	return context.JSON(admin)
}

func (controller *AdminController) UpdateAdmin(context *fiber.Ctx) error {
	admin := new(model.Admin)

	if err := context.BodyParser(admin); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(admin).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return context.JSON(admin)
}

func (controller *AdminController) DeleteAdmin(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.Admin{}, id).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"message": "Admin deleted successfully",
	})
}

func (controller *AdminController) ReadAdminsFromFile(filePath string) ([]*model.Admin, error) {
	mapper, err := core.CreateMapper[model.Admin](filePath)
	if err != nil {
		return nil, err
	}

	admins := mapper.Deserialize()
	return admins, nil
}
