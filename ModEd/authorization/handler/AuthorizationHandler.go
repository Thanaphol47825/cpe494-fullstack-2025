package handler

import (
	"ModEd/authorization/model/dto"
	"ModEd/core"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AuthorizationHandler struct {
	Application *core.ModEdApplication
}

func NewAuthorizationHandler() *AuthorizationHandler {
	return &AuthorizationHandler{}
}

func (controller *AuthorizationHandler) Login(ctx *fiber.Ctx) error {
	var loginDto dto.LoginDto
	if err := ctx.BodyParser(&loginDto); err != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
			Message:   "invalid request",
		})
	}

	// TODO: Find user and verify password
	userId := "1" // Temp

	// Save Redis
	sessionId, err := controller.Application.SessionManager.Set(userId)
	if err != nil {
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
	return ctx.JSON(fiber.Map{
		"isSuccess": true,
	})
}

func (controller *AuthorizationHandler) Verify(ctx *fiber.Ctx) error {
	var token string
	if token = ctx.Cookies("token"); token == "" {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    401,
			Message:   "cookie not exist",
		})
	}

	// Load from Redis
	session, status := controller.Application.SessionManager.Get(token)
	if !status {
		ctx.Cookie(&fiber.Cookie{Name: "token", Expires: time.Unix(0, 0)})
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"userId":    session.UserID,
	})
}
