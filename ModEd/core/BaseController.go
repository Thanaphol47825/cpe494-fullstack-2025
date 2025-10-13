package core

import "github.com/gofiber/fiber/v2"

type HTTPMethod int

const (
	POST HTTPMethod = iota
	GET  HTTPMethod = iota
)

type RouteItem struct {
	Route          string
	Handler        fiber.Handler
	Method         HTTPMethod
	Authentication Authentication
}

type ModelMeta struct {
	Path  string
	Model interface{}
}

type BaseController interface {
	GetRoute() []*RouteItem
	SetApplication(application *ModEdApplication)
	GetModelMeta() []*ModelMeta
}
