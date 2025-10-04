package core

import (
	"ModEd/core/model"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type RoleBasedAccessControl struct {
	DB             *gorm.DB
	SessionManager *SessionManager
}

type AuthType int

const (
	AuthNone AuthType = iota
	AuthAny
	AuthRole
)

type Middleware struct {
	AuthType AuthType
	Roles    []string
}

func NewRoleBasedAccessControl(DB *gorm.DB, SessionManager *SessionManager) *RoleBasedAccessControl {
	return &RoleBasedAccessControl{
		DB:             DB,
		SessionManager: SessionManager,
	}
}

func (rbac *RoleBasedAccessControl) RBACMiddleware(middleware Middleware) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		// AuthNone
		if middleware.AuthType == AuthNone {
			return ctx.Next()
		}

		// AuthAny and AuthRole
		tokenCookie := ctx.Cookies("token", "")
		session, status := rbac.SessionManager.Get(tokenCookie)
		if !status {
			return SendResponse(ctx, BaseApiResponse{
				IsSuccess: false,
				Status:    http.StatusForbidden,
				Message:   "unauthorized",
			})
		}

		// AuthAny
		if middleware.AuthType == AuthAny {
			return ctx.Next()
		}

		// AuthRole
		if !rbac.hasAccess(session.UserID, middleware.Roles) {
			return SendResponse(ctx, BaseApiResponse{
				IsSuccess: false,
				Status:    http.StatusForbidden,
				Message:   "permission denied",
			})
		}

		return ctx.Next()
	}
}

func (rbac *RoleBasedAccessControl) hasAccess(userId string, Roles []string) bool {
	var count int64
	rbac.DB.Model(&model.UserRole{}).
		Where("user_id = ? AND role IN ?", userId, Roles).
		Count(&count)
	return count > 0
}
