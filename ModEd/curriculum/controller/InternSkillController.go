package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"

	"github.com/gofiber/fiber/v2"
)

type InternSkillController struct {
	application *core.ModEdApplication
	handler     *handler.InternSkillHandler
}

func NewInternSkillController(app *core.ModEdApplication) *InternSkillController {
	return &InternSkillController{
		application: app,
		handler:     handler.NewInternSkillHandler(app),
	}
}

func (c *InternSkillController) RenderMain(ctx *fiber.Ctx) error {
	return ctx.SendString("Hello InternSkill")
}

func (c *InternSkillController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternSkillRenderMain",
		Handler: c.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternSkill/:id?",
		Handler: c.handler.GetInternSkill,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternSkill",
		Handler: c.handler.CreateInternSkill,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternSkillRender",
		Handler: c.handler.CreateInternSkillRender,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateInternSkill/:id",
		Handler: c.handler.UpdateInternSkill,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteInternSkill/:id",
		Handler: c.handler.DeleteInternSkill,
		Method:  core.POST,
	})

	return routeList
}

func (c *InternSkillController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (c *InternSkillController) SetApplication(app *core.ModEdApplication) {
	c.application = app
}
