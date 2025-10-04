package handler

import (
	"ModEd/admin/dto"
	"ModEd/core"
	"ModEd/core/model"

	"github.com/gofiber/fiber/v2"
)

type RBACHandler struct {
	Application *core.ModEdApplication
}

func NewRBACHandler() *RBACHandler {
	return &RBACHandler{}
}

func (controller *RBACHandler) AddUserRole(ctx *fiber.Ctx) error {
	var body dto.AddUserRole
	if err := ctx.BodyParser(&body); err != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.ErrBadRequest.Code,
			Message:   "invalid request",
		})
	}

	var count int64
	controller.Application.DB.Model(&model.UserRole{}).
		Where("user_id = ? AND role = ?", body.UserID, body.Role).
		Count(&count)

	if count > 0 {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusConflict,
			Message:   "role already assigned to this user",
		})
	}

	if err := controller.Application.DB.Create(&model.UserRole{
		UserID: body.UserID,
		Role:   body.Role,
	}).Error; err != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.ErrInternalServerError.Code,
			Message:   "failed to add user role",
		})
	}

	return core.SendResponse(ctx, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Message:   "success",
	})
}

func (controller *RBACHandler) DelUserRole(ctx *fiber.Ctx) error {
	var body dto.DelUserRole
	if err := ctx.BodyParser(&body); err != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.ErrBadRequest.Code,
			Message:   "invalid request",
		})
	}

	if err := controller.Application.DB.Where("user_id = ? AND role = ?", body.UserID, body.Role).Delete(&model.UserRole{}).Error; err != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.ErrInternalServerError.Code,
			Message:   "failed to delete user role",
		})
	}

	return core.SendResponse(ctx, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Message:   "success",
	})
}
