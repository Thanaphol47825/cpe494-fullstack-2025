package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
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

func (controller *AdminController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *AdminController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AdminController) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "AdminCreate.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   err.Error(),
		})
	}

	moduleList := controller.application.DiscoverModules()
	modulesJSON, err := json.Marshal(moduleList)
	if err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   err.Error(),
		})
	}

	rendered := tmpl.Render(map[string]any{
		"title":   "Create Admin",
		"RootURL": controller.application.RootURL,
		"modules": string(modulesJSON),
	})

	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (controller *AdminController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateAdminForm",
		Handler: controller.RenderCreateForm,
		Method:  core.GET,
	})

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
		Route:   "/recruit/UpdateAdmin",
		Handler: controller.UpdateAdmin,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/ImportAdmins",
		Handler: controller.ImportAdmins,
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

func (controller *AdminController) ImportAdmins(c *fiber.Ctx) error {
	db := controller.application.DB
	clear := c.QueryBool("clear", true)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file is required"})
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext != ".csv" && ext != ".json" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "only .csv or .json are allowed"})
	}

	tmpFile, err := os.CreateTemp("", "admins-*"+ext)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot create temp file"})
	}
	tmpPath := tmpFile.Name()
	_ = tmpFile.Close()
	defer os.Remove(tmpPath)

	if err := c.SaveFile(fileHeader, tmpPath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot save uploaded file: " + err.Error()})
	}

	mapper, err := core.CreateMapper[model.Admin](tmpPath)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	admins := mapper.Deserialize()
	var inserted int

	if err := db.Transaction(func(tx *gorm.DB) error {
		if clear {
			if err := tx.Exec(`TRUNCATE TABLE admins RESTART IDENTITY CASCADE`).Error; err != nil {
				return err
			}
		}
		if len(admins) > 0 {
			if err := tx.Create(&admins).Error; err != nil {
				return err
			}
			inserted = len(admins)
		}
		return nil
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":       "admins imported successfully",
		"cleared":       clear,
		"insertedCount": inserted,
	})
}
