package controller

import (
	"ModEd/common/model"
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type StudentController struct {
	application *core.ModEdApplication
}

func (controller *StudentController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Student")
}

func (controller *StudentController) GetInfo(context *fiber.Ctx) error {
	student := &model.Student{}
	/// TODO convert model object to JSON
	return context.JSON(student)
}

func NewStudentController() *StudentController {
	controller := &StudentController{}
	return controller
}

func (controller *StudentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/Student",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/Student/info",
		Handler: controller.GetInfo,
		Method:  core.GET,
	})
	return routeList
}

func (controller *StudentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
