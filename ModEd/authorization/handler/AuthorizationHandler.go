package handler

import (
	"ModEd/authorization/model/dto"
	"ModEd/core"
	"ModEd/utils"
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

	// Generate SessionId and return cookie
	sessionId := uuid.New()
	jwtUtils := utils.NewJWTUtils(controller.Application.Configuration.Jwt)
	token, err := jwtUtils.SignSessionId(sessionId.String())
	if err != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
			Message:   "failed to generate token",
		})
	}

	// Save Redis
	if controller.Application.Redis.Set(context.Background(), fmt.Sprintf("session:%s", sessionId.String()), userId, time.Hour*24*7).Err() != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    400,
			Message:   "failed to set token",
		})
	}

	// Set-Cookie
	ctx.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
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

	jwtUtils := utils.NewJWTUtils(controller.Application.Configuration.Jwt)
	sessionId, err := jwtUtils.UnsignSessionId(token)
	if err != nil {
		ctx.ClearCookie("token")
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    401,
			Message:   "failed to unsign",
		})
	}

	// Get from Redis
	userId, err := controller.Application.Redis.Get(ctx.Context(), fmt.Sprintf("session:%s", sessionId)).Result()
	if err != nil {
		ctx.ClearCookie("token")
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    401,
			Message:   "failed to get token",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"userId":    userId,
	})
}
