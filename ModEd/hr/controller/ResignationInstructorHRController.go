package controller

import (
	"ModEd/core"
	"ModEd/hr/model"
	"ModEd/hr/util"
	"fmt"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type ResignationInstructorHRController struct {
	application *core.ModEdApplication
}

func (ctl *ResignationInstructorHRController) RenderResignForm(c *fiber.Ctx) error {
	path := filepath.Join(ctl.application.RootPath, "hr", "view", "ResignInstructor.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	rendered := tmpl.Render(map[string]any{
		"RootURL": ctl.application.RootURL,
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func NewResignationInstructorHRController() *ResignationInstructorHRController {
	return &ResignationInstructorHRController{}
}

// ---------- low-level ops ----------

func (c *ResignationInstructorHRController) insert(req *model.RequestResignationInstructor) error {
	return c.application.DB.Create(req).Error
}
func (c *ResignationInstructorHRController) getAll(limit, offset int) ([]model.RequestResignationInstructor, error) {
	var rows []model.RequestResignationInstructor
	tx := c.application.DB
	if limit > 0 {
		tx = tx.Limit(limit)
	}
	if offset > 0 {
		tx = tx.Offset(offset)
	}
	err := tx.Order("id DESC").Find(&rows).Error
	return rows, err
}
func (c *ResignationInstructorHRController) getByID(id uint) (*model.RequestResignationInstructor, error) {
	var row model.RequestResignationInstructor
	if err := c.application.DB.First(&row, id).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

func (c *ResignationInstructorHRController) deleteByID(id uint) error {
	return c.application.DB.Delete(&model.RequestResignationInstructor{}, id).Error
}

// ---------- domain ops ----------

func (c *ResignationInstructorHRController) SubmitResignationInstructor(instructorID, reason string) error {
	tm := &util.TransactionManager{DB: c.application.DB}
	return tm.Execute(func(tx *gorm.DB) error {
		params := model.CreateRequestParams{
			ID:     instructorID,
			Reason: reason,
		}
		reqIface, err := (model.RequestFactory{}).CreateRequest(model.RoleInstructor, model.RequestTypeResignation, params)
		if err != nil {
			return fmt.Errorf("failed to create resignation request using factory: %w", err)
		}
		req := reqIface.(*model.RequestResignationInstructor) // safe by factory path

		// NOTE: ถ้าโมเดลคุณมีเมธอด Validate() ของตัวเองอยู่แล้ว ค่อยเปิดใช้บรรทัดด้านล่าง
		// if err := req.Validate(); err != nil { return fmt.Errorf("validate: %w", err) }

		if err := tx.Create(req).Error; err != nil {
			return fmt.Errorf("failed to insert resignation request: %w", err)
		}
		return nil
	})
}

func (c *ResignationInstructorHRController) ReviewInstructorResignRequest(requestID, action, reason string) error {
	return ReviewRequest(
		requestID,
		action,
		reason,
		func(id uint) (Reviewable, error) {
			return c.getByID(id)
		},
		func(r Reviewable) error {
			return c.application.DB.Save(r).Error
		},
	)
}

// ---------- HTTP (Fiber) ----------

func (ctl *ResignationInstructorHRController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/resignation-instructor-form", Method: core.GET, Handler: ctl.RenderResignForm},
		{Route: "/hr/resignation-instructor-requests", Method: core.GET, Handler: ctl.HandleList},
		{Route: "/hr/resignation-instructor-requests/:id", Method: core.GET, Handler: ctl.HandleGetByID},
		{Route: "/hr/resignation-instructor-requests", Method: core.POST, Handler: ctl.HandleCreate},
		{Route: "/hr/resignation-instructor-requests/:id/review", Method: core.POST, Handler: ctl.HandleReview},
		{Route: "/hr/resignation-instructor-requests/:id/delete", Method: core.POST, Handler: ctl.HandleDelete},
		{Route: "/hr/resignation-instructor-requests/delete", Method: core.POST, Handler: ctl.HandleDeleteLegacy},

		// health (ถ้าอยากมี)
		// {Route: "/hr/ResignationInstructor", Method: core.GET, Handler: func(c *fiber.Ctx) error { return c.SendString("Resignation Instructor API is up") }},
	}
}

func (ctl *ResignationInstructorHRController) HandleList(c *fiber.Ctx) error {
	rows, err := ctl.getAll(c.QueryInt("limit"), c.QueryInt("offset"))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(rows)
}

func (ctl *ResignationInstructorHRController) HandleGetByID(c *fiber.Ctx) error {
	id64, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	row, err := ctl.getByID(uint(id64))
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(row)
}

func (ctl *ResignationInstructorHRController) HandleCreate(c *fiber.Ctx) error {
	var body struct {
		InstructorCode string `json:"InstructorCode"`
		Reason         string `json:"Reason"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if body.InstructorCode == "" || body.Reason == "" {
		return fiber.NewError(fiber.StatusBadRequest, "InstructorCode and Reason are required")
	}

	if err := ctl.SubmitResignationInstructor(body.InstructorCode, body.Reason); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "resignation submitted"})
}

func (ctl *ResignationInstructorHRController) HandleReview(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Action string `json:"action"` // "approve" | "reject"
		Reason string `json:"reason"` // ใช้เมื่อ reject
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if err := ctl.ReviewInstructorResignRequest(id, body.Action, body.Reason); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "updated"})
}

func (ctl *ResignationInstructorHRController) HandleDelete(c *fiber.Ctx) error {
	id64, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	if err := ctl.deleteByID(uint(id64)); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "deleted"})
}

func (ctl *ResignationInstructorHRController) HandleDeleteLegacy(c *fiber.Ctx) error {
	var body struct {
		ID uint `json:"id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if body.ID == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "id is required")
	}
	if err := ctl.deleteByID(body.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "deleted"})
}

func (ctl *ResignationInstructorHRController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (ctl *ResignationInstructorHRController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&model.RequestResignationInstructor{})
}
