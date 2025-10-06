package controller

import (
	"ModEd/authorization/handler"
	"ModEd/core"
)

type AuthorizationController struct {
	application *core.ModEdApplication
	handler     *handler.AuthorizationHandler
}

func NewAuthorizationController() *AuthorizationController {
	return &AuthorizationController{
		handler: handler.NewAuthorizationHandler(),
	}
}

func (controller *AuthorizationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/auth/login",
		Handler: controller.handler.Login,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/auth/verify",
		Handler: controller.handler.Verify,
		Method:  core.GET,
	})
	return routeList
}

func (controller *AuthorizationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *AuthorizationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.Application = application
}
