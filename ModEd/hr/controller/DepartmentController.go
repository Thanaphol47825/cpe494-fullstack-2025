package controller

import (
	"ModEd/common/model"
	"ModEd/core"
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type DepartmentController struct {
	application *core.ModEdApplication
}

func NewDepartmentController() *DepartmentController { return &DepartmentController{} }

func (ctl *DepartmentController) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Department API is up")
}

func (ctl *DepartmentController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/departments", Method: core.GET, Handler: ctl.List},
		{Route: "/hr/departments/:name", Method: core.GET, Handler: ctl.GetByName},
		{Route: "/hr/departments", Method: core.POST, Handler: ctl.Create},

		{Route: "/hr/departments/:name/update", Method: core.POST, Handler: ctl.UpdateByName},
		{Route: "/hr/departments/:name/delete", Method: core.POST, Handler: ctl.DeleteByName},

		{Route: "/hr/Department", Method: core.GET, Handler: ctl.RenderMain},
	}
}

func (ctl *DepartmentController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (ctl *DepartmentController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
}

func (ctl *DepartmentController) List(c *fiber.Ctx) error {
	var rows []map[string]interface{}
	tx := ctl.application.DB.Table("departments")
	if l := c.QueryInt("limit"); l > 0 {
		tx = tx.Limit(l)
	}
	if o := c.QueryInt("offset"); o > 0 {
		tx = tx.Offset(o)
	}
	if err := tx.Find(&rows).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(rows)
}

func (ctl *DepartmentController) GetByName(c *fiber.Ctx) error {
	name := c.Params("name")
	var row map[string]interface{}
	q := ctl.application.DB.Table("departments").
		Where("name = ?", strings.Replace(name, "%20", " ", -1)).
		Take(&row)
	if err := q.Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(http.StatusNotFound, "department not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(row)
}

func (ctl *DepartmentController) Create(c *fiber.Ctx) error {
    var payload map[string]interface{}
    if err := c.BodyParser(&payload); err != nil {
        return fiber.NewError(http.StatusBadRequest, err.Error())
    }

    delete(payload, "id")
    if v, ok := payload["parent"]; ok {
        payload["faculty"] = v
        delete(payload, "parent")
    }
    if v, ok := payload["budget"]; ok {
        switch b := v.(type) {
        case float64:
            payload["budget"] = int(b)
        case string:
            if n, err := strconv.Atoi(b); err == nil {
                payload["budget"] = n
            } else {
                return fiber.NewError(http.StatusBadRequest, "budget must be a number")
            }
        }
    }

    if payload["name"] == nil || strings.TrimSpace(payload["name"].(string)) == "" {
        return fiber.NewError(http.StatusBadRequest, "department name is required")
    }
    if payload["faculty"] == nil || strings.TrimSpace(payload["faculty"].(string)) == "" {
        return fiber.NewError(http.StatusBadRequest, "faculty is required")
    }

    if err := ctl.application.DB.Table("departments").Create(&payload).Error; err != nil {
        return fiber.NewError(http.StatusInternalServerError, err.Error())
    }
    return c.Status(http.StatusCreated).JSON(payload)
}

func (ctl *DepartmentController) UpdateByName(c *fiber.Ctx) error {
	name := strings.TrimSpace(c.Params("name"))

	var patch map[string]interface{}
	if err := c.BodyParser(&patch); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	delete(patch, "id")
	if v, ok := patch["parent"]; ok {
		patch["faculty"] = v
		delete(patch, "parent")
	}
	if v, ok := patch["budget"]; ok {
		switch b := v.(type) {
		case float64:
			patch["budget"] = int(b)
		case string:
			if n, err := strconv.Atoi(b); err == nil {
				patch["budget"] = n
			} else {
				return fiber.NewError(http.StatusBadRequest, "budget must be a number")
			}
		}
	}

	var dept model.Department
	if err := ctl.application.DB.
		Where("name = ?", strings.Replace(name, "%20", " ", -1)).
		First(&dept).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(http.StatusNotFound, "department not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	if err := ctl.application.DB.Model(&dept).Updates(patch).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"updated": true, "id": dept.ID})
}

func (ctl *DepartmentController) DeleteByName(c *fiber.Ctx) error {
	name := c.Params("name")
	res := ctl.application.DB.Exec("DELETE FROM departments WHERE name = ?", name)
	if err := res.Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	if res.RowsAffected == 0 {
		return fiber.NewError(http.StatusNotFound, "department not found")
	}
	return c.SendStatus(http.StatusNoContent)
}
