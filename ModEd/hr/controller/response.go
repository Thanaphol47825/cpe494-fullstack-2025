package controller

import "github.com/gofiber/fiber/v2"

type apiError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type apiResponse struct {
	IsSuccess bool        `json:"isSuccess"`
	Result    interface{} `json:"result,omitempty"`
	Error     *apiError   `json:"error,omitempty"`
}

func writeOK(c *fiber.Ctx, status int, data interface{}) error {
	return c.Status(status).JSON(apiResponse{
		IsSuccess: true,
		Result:    data,
	})
}

func writeErr(c *fiber.Ctx, status int, msg string) error {
	return c.Status(status).JSON(apiResponse{
		IsSuccess: false,
		Error: &apiError{
			Code:    status,
			Message: msg,
		},
	})
}
