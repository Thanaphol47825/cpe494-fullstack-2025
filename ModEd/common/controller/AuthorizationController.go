package controller

import (
	"ModEd/common/model"
	"ModEd/common/model/dto"
	"ModEd/core"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
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
		ctx.Cookie(&fiber.Cookie{Name: "moded_token", Expires: time.Unix(0, 0)})
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
			Message:   "invalid request",
		})
	}

	var user model.User
	if err := controller.application.DB.Table("users").
		Where("username = ?", loginDto.Username).
		First(&user).Error; err != nil {
		controller.clearCookie(ctx)
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusUnauthorized,
			Message:   "invalid credentials",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginDto.Password)); err != nil {
		controller.clearCookie(ctx)
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusUnauthorized,
			Message:   "invalid credentials",
		})
	}
	userId := int64(user.ID)

	// Save Redis
	sessionId, err := controller.application.SessionManager.Set(fmt.Sprint(userId))
	if err != nil {
		controller.clearCookie(ctx)
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
		})
	}

	// Set-Cookie
	ctx.Cookie(&fiber.Cookie{
		Name:     "moded_token",
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

func (controller *AuthorizationController) clearCookie(ctx *fiber.Ctx) {
	ctx.Cookie(&fiber.Cookie{Name: "moded_token", Expires: time.Unix(0, 0)})
}
