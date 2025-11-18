package controller

import (
	"ModEd/common/model"
	"ModEd/core"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type AuthController struct {
	application *core.ModEdApplication
}

func NewAuthController() *AuthController {
	return &AuthController{}
}

func (controller *AuthController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/login",
		Handler: controller.RenderLoginPage,
		Method:  core.GET,
		Authentication: core.Authentication{
			AuthType: core.AuthNone,
		},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/auth/me",
		Handler: controller.GetCurrentUser,
		Method:  core.GET,
		Authentication: core.Authentication{
			AuthType: core.AuthAny,
		},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/auth/logout",
		Handler: controller.Logout,
		Method:  core.POST,
		Authentication: core.Authentication{
			AuthType: core.AuthAny,
		},
	})

	return routeList
}

func (controller *AuthController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{}
}

func (controller *AuthController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AuthController) RenderLoginPage(c *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "Login.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return core.SendResponse(c, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   err.Error(),
		})
	}

	rendered := tmpl.Render(map[string]any{
		"title":   "Login - Recruit Module",
		"RootURL": controller.application.RootURL,
	})

	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (controller *AuthController) GetCurrentUser(ctx *fiber.Ctx) error {
	userIDInterface := ctx.Locals("userId")
	if userIDInterface == nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusUnauthorized,
			Message:   "not authenticated",
		})
	}

	userID, ok := userIDInterface.(string)
	if !ok {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusInternalServerError,
			Message:   "invalid user id format",
		})
	}

	var user model.User
	if err := controller.application.DB.Table("users").
		Where("id = ?", userID).
		First(&user).Error; err != nil {
		return core.SendResponse(ctx, core.BaseApiResponse{
			IsSuccess: false,
			Status:    fiber.StatusNotFound,
			Message:   "user not found",
		})
	}

	// Get user roles
	var roles []string
	var userRoles []struct {
		Role string `gorm:"column:role"`
	}
	controller.application.DB.Table("user_roles").
		Select("role").
		Where("user_id = ?", userID).
		Find(&userRoles)

	for _, ur := range userRoles {
		roles = append(roles, ur.Role)
	}

	// Remove password from response
	userResponse := fiber.Map{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
		"is_admin": user.IsAdmin,
		"roles":    roles,
	}

	return core.SendResponse(ctx, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Result:    userResponse,
	})
}

func (controller *AuthController) Logout(ctx *fiber.Ctx) error {
	tokenCookie := ctx.Cookies("moded_token", "")
	if tokenCookie != "" {
		controller.application.SessionManager.Delete(tokenCookie)
	}
	ctx.Cookie(&fiber.Cookie{Name: "moded_token", Expires: time.Unix(0, 0)})
	return core.SendResponse(ctx, core.BaseApiResponse{
		IsSuccess: true,
		Status:    fiber.StatusOK,
		Message:   "logged out successfully",
	})
}
