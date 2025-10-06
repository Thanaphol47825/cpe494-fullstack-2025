package controller

import (
	cmodel "ModEd/common/model"
	"ModEd/core"
	hrmodel "ModEd/hr/model"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InstructorController struct {
	application *core.ModEdApplication
}

func NewInstructorController() *InstructorController { return &InstructorController{} }

func (ctl *InstructorController) RenderMain(c *fiber.Ctx) error {
	return writeOK(c, http.StatusOK, fiber.Map{"message": "Instructor HR API is up"})
}

func (ctl *InstructorController) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(ctl.application.RootPath, "hr", "view", "HrTemplate.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}

	// Get module list for template
	moduleList := ctl.application.DiscoverModules()
	modulesJSON, err := json.Marshal(moduleList)
	if err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}

	rendered := tmpl.Render(map[string]any{
		"title":   "Create Instructor",
		"RootURL": ctl.application.RootURL,
		"modules": string(modulesJSON),
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (ctl *InstructorController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{

		{Route: "/hr/instructors/create", Method: core.GET, Handler: ctl.RenderCreateForm},

		{Route: "/hr/instructors", Method: core.GET, Handler: ctl.List},
		{Route: "/hr/instructors", Method: core.POST, Handler: ctl.Create},

		{Route: "/hr/instructors/:code/update", Method: core.POST, Handler: ctl.UpdateByCode},
		{Route: "/hr/instructors/:code/delete", Method: core.POST, Handler: ctl.DeleteByCode},
		{Route: "/hr/instructors/:code", Method: core.GET, Handler: ctl.GetByCode},
		{Route: "/hr/instructors/id/:id/delete", Method: core.POST, Handler: ctl.DeleteByID},

		{Route: "/hr/Instructor", Method: core.GET, Handler: ctl.RenderMain}, // ของเดิม
	}
}

func (ctl *InstructorController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	modelMetaList = append(modelMetaList, &core.ModelMeta{
		Path:  "hr/instructors",
		Model: &cmodel.Instructor{},
	})
	return modelMetaList
}

func (ctl *InstructorController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&cmodel.Instructor{})

}

// ---------- Helpers ----------

type posIn struct {
	AcademicPosition   any `json:"AcademicPosition"`
	DepartmentPosition any `json:"DepartmentPosition"`
}

func coercePos(v any, parseWord func(string) (int, error)) (*int, error) {
	switch x := v.(type) {
	case nil:
		return nil, nil
	case float64:
		i := int(x)
		return &i, nil
	case string:
		if x == "" {
			return nil, nil
		}
		i, err := parseWord(x)
		if err != nil {
			return nil, err
		}
		return &i, nil
	default:
		return nil, fmt.Errorf("unsupported type for position")
	}
}

// ---------- Handlers ----------

func (ctl *InstructorController) List(c *fiber.Ctx) error {
	var out []cmodel.Instructor
	tx := ctl.application.DB
	if l := c.QueryInt("limit"); l > 0 {
		tx = tx.Limit(l)
	}
	if o := c.QueryInt("offset"); o > 0 {
		tx = tx.Offset(o)
	}
	if err := tx.Find(&out).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, out)
}

func (ctl *InstructorController) GetByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	var rec cmodel.Instructor
	if err := ctl.application.DB.Where("instructor_code = ?", code).First(&rec).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return writeErr(c, http.StatusNotFound, "instructor not found")
		}
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, rec)
}

func (ctl *InstructorController) Create(c *fiber.Ctx) error {
	var payload cmodel.Instructor
	if err := c.BodyParser(&payload); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}

	var pos posIn
	_ = json.Unmarshal(c.Body(), &pos)

	if p, err := coercePos(pos.AcademicPosition, parseAcademicPosAsInt); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	} else if p != nil {
		payload.AcademicPosition = p
	}
	if p, err := coercePos(pos.DepartmentPosition, parseDepartmentPosAsInt); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	} else if p != nil {
		payload.DepartmentPosition = p
	}

	if err := payload.Validate(); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}

	if err := ctl.application.DB.Create(&payload).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusCreated, payload)
}

func (ctl *InstructorController) UpdateByCode(c *fiber.Ctx) error {
	code := c.Params("code")

	var exist cmodel.Instructor
	if err := ctl.application.DB.Where("instructor_code = ?", code).First(&exist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return writeErr(c, http.StatusNotFound, "instructor not found")
		}
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}

	var tmp map[string]any
	if err := json.Unmarshal(c.Body(), &tmp); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}

	if v, ok := tmp["first_name"].(string); ok {
		exist.FirstName = v
	}
	if v, ok := tmp["last_name"].(string); ok {
		exist.LastName = v
	}
	if v, ok := tmp["email"].(string); ok {
		exist.Email = v
	}
	if v, ok := tmp["Gender"].(string); ok {
		exist.Gender = &v
	}
	if v, ok := tmp["CitizenID"].(string); ok {
		exist.CitizenID = &v
	}
	if v, ok := tmp["PhoneNumber"].(string); ok {
		exist.PhoneNumber = &v
	}
	if v, ok := tmp["Salary"].(float64); ok {
		exist.Salary = &v
	}

	var pos posIn
	_ = json.Unmarshal(c.Body(), &pos)
	if p, err := coercePos(pos.AcademicPosition, parseAcademicPosAsInt); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	} else if p != nil {
		exist.AcademicPosition = p
	}
	if p, err := coercePos(pos.DepartmentPosition, parseDepartmentPosAsInt); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	} else if p != nil {
		exist.DepartmentPosition = p
	}

	if err := ctl.application.DB.Save(&exist).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, exist)
}

func (ctl *InstructorController) DeleteByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	if err := ctl.application.DB.Where("instructor_code = ?", code).
		Delete(&cmodel.Instructor{}).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, fiber.Map{"deleted": true, "instructor_code": code})
}

func (ctl *InstructorController) DeleteByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil || id == 0 {
		return writeErr(c, http.StatusBadRequest, "invalid id")
	}
	if err := ctl.application.DB.
		Where("id = ?", id).
		Delete(&cmodel.Instructor{}).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, fiber.Map{"deleted": true, "id": id})
}

func parseAcademicPosAsInt(s string) (int, error) {
	v, err := hrmodel.ParseAcademicPosition(s)
	if err != nil {
		return 0, err
	}
	return int(v), nil
}

func parseDepartmentPosAsInt(s string) (int, error) {
	v, err := hrmodel.ParseDepartmentPosition(s)
	if err != nil {
		return 0, err
	}
	return int(v), nil
}
