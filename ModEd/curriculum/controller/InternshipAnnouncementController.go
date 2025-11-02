package controller

import (
	"ModEd/core"
	"ModEd/curriculum/handler"

	"github.com/gofiber/fiber/v2"
)

type InternshipAnnouncementController struct {
	application *core.ModEdApplication
	handler     *handler.InternshipAnnouncementHandler
}

func NewInternshipAnnouncementController(app *core.ModEdApplication) *InternshipAnnouncementController {
	return &InternshipAnnouncementController{
		application: app,
		handler:     handler.NewInternshipAnnouncementHandler(app),
	}
}

func (c *InternshipAnnouncementController) RenderMain(ctx *fiber.Ctx) error {
	return ctx.SendString("Hello InternshipAnnouncement")
}

func (c *InternshipAnnouncementController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAnnouncementRenderMain",
		Handler: c.RenderMain,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAnnouncement/:id?",
		Handler: c.handler.GetInternshipAnnouncement,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipAnnouncement",
		Handler: c.handler.CreateInternshipAnnouncement,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/CreateInternshipAnnouncementRender",
		Handler: c.handler.CreateInternshipAnnouncementRender,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/UpdateInternshipAnnouncement/:id",
		Handler: c.handler.UpdateInternshipAnnouncement,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/DeleteInternshipAnnouncement/:id",
		Handler: c.handler.DeleteInternshipAnnouncement,
		Method:  core.POST,
	})

	return routeList
}

func (c *InternshipAnnouncementController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (c *InternshipAnnouncementController) SetApplication(app *core.ModEdApplication) {
	c.application = app
}
