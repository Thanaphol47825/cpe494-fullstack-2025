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
	AuthAdmin
)

type Authentication struct {
	AuthType AuthType
	Roles    []string
}

func NewRoleBasedAccessControl(DB *gorm.DB, SessionManager *SessionManager) *RoleBasedAccessControl {
	return &RoleBasedAccessControl{
		DB:             DB,
		SessionManager: SessionManager,
	}
}

func (rbac *RoleBasedAccessControl) RBACMiddleware(middleware Authentication) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		// AuthNone
		if middleware.AuthType == AuthNone {
			return ctx.Next()
		}

		// AuthAny and AuthRole
		tokenCookie := ctx.Cookies("moded_token", "")
		userID, status := rbac.SessionManager.Get(tokenCookie)
		if !status {
			return SendResponse(ctx, BaseApiResponse{
				IsSuccess: false,
				Status:    http.StatusForbidden,
				Message:   "unauthorized",
			})
		}

		var dbUser struct {
			ID      uint `gorm:"column:id"`
			IsAdmin bool `gorm:"column:is_admin"`
		}
		if err := rbac.DB.Table("users").Select("id, is_admin").Where("id = ?", userID).Limit(1).Take(&dbUser).Error; err != nil {
			return SendResponse(ctx, BaseApiResponse{
				IsSuccess: false,
				Status:    http.StatusForbidden,
				Message:   "unauthorized",
			})
		}

		// AuthAny, AuthRole, AuthAdmin
		ctx.Locals("userId", userID)

		// AuthAny
		if middleware.AuthType == AuthAny {
			return ctx.Next()
		}
		// AuthRole
		switch middleware.AuthType {
		case AuthRole:
			if !rbac.hasAccess(userID, middleware.Roles) {
				return SendResponse(ctx, BaseApiResponse{
					IsSuccess: false,
					Status:    http.StatusForbidden,
					Message:   "permission denied",
				})
			}
		case AuthAdmin:
			if !dbUser.IsAdmin {
				return SendResponse(ctx, BaseApiResponse{
					IsSuccess: false,
					Status:    http.StatusForbidden,
					Message:   "admin permission required",
				})
			}
		}

		return ctx.Next()
	}
}

func (rbac *RoleBasedAccessControl) hasAccess(userId string, Roles []string) bool {
	var count int64
	rbac.DB.Model(&model.UserRole{}).
		Where("user_id = ? AND role IN ?", userId, Roles).Count(&count)
	return count > 0
}
