package controller

import (
	"ModEd/common/model/dto"
	"ModEd/core"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AuthorizationController struct {
	application *core.ModEdApplication
}

func NewAuthorizationController() *AuthorizationController {
	return &AuthorizationController{}
}

func (controller *AuthorizationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/auth/login",
		Handler: controller.Login,
		Method:  core.POST,
	})
	return routeList
}

func (controller *AuthorizationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *AuthorizationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AuthorizationController) Login(ctx *fiber.Ctx) error {
	var loginDto dto.LoginDto
	if err := ctx.BodyParser(&loginDto); err != nil {
		ctx.Cookie(&fiber.Cookie{Name: "token", Expires: time.Unix(0, 0)})
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
			Message:   "invalid request",
		})
	}

	// TODO: Find user and verify password
	userId := "1" // Temp

	// Save Redis
	sessionId, err := controller.application.SessionManager.Set(userId)
	if err != nil {
		ctx.Cookie(&fiber.Cookie{Name: "token", Expires: time.Unix(0, 0)})
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
		})
	}

	// Set-Cookie
	ctx.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    sessionId,
		Expires:  time.Now().Add(time.Hour * 24 * 7),
		HTTPOnly: true,
		Secure:   true,
	})
	return core.SendResponse(ctx, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Message:   "success",
	})
}
