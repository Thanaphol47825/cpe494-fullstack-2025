package controller

import (
	"ModEd/admin/handler"
	"ModEd/core"
)

type RBACController struct {
	application *core.ModEdApplication
	handler     *handler.RBACHandler
}

func NewAuthorizationController() *RBACController {
	return &RBACController{
		handler: handler.NewRBACHandler(),
	}
}

func (controller *RBACController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/admin/add_user_role",
		Handler: controller.handler.AddUserRole,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/admin/del_user_role",
		Handler: controller.handler.DelUserRole,
		Method:  core.POST,
	})
	return routeList
}

func (controller *RBACController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
	controller.handler.Application = application
}

func (controller *RBACController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}
