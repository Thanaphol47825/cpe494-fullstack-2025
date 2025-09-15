package core

import "github.com/gofiber/fiber/v2"

type BaseApiResponse struct {
	IsSuccess bool        `json:"isSuccess"`
	Status    int         `json:"-"`
	Result    interface{} `json:"result,omitempty"`
	Message   string      `json:"message,omitempty"`
}

func SendResponse(c *fiber.Ctx, data BaseApiResponse) error {
	return c.Status(data.Status).JSON(data)
}
