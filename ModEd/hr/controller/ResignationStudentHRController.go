package controller

import (
	"ModEd/core"
	"ModEd/hr/model"
	"ModEd/hr/util"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ResignationStudentHRController struct {
	application *core.ModEdApplication
}

func NewResignationStudentHRController() *ResignationStudentHRController {
	return &ResignationStudentHRController{}
}

// ---------- low-level ops ----------

func (c *ResignationStudentHRController) insert(req *model.RequestResignationStudent) error {
	return c.application.DB.Create(req).Error
}

func (c *ResignationStudentHRController) getAll(limit, offset int) ([]model.RequestResignationStudent, error) {
	var rows []model.RequestResignationStudent
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

func (c *ResignationStudentHRController) getByID(id uint) (*model.RequestResignationStudent, error) {
	var row model.RequestResignationStudent
	if err := c.application.DB.First(&row, id).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

// ---------- domain ops ----------

func (c *ResignationStudentHRController) SubmitResignationStudent(studentID, reason string) error {
	tm := &util.TransactionManager{DB: c.application.DB}
	return tm.Execute(func(tx *gorm.DB) error {
		params := model.CreateRequestParams{
			ID:     studentID,
			Reason: reason,
		}
		reqIface, err := (model.RequestFactory{}).CreateRequest(model.RoleStudent, model.RequestTypeResignation, params)
		if err != nil {
			return fmt.Errorf("failed to create resignation request using factory: %w", err)
		}
		req := reqIface.(*model.RequestResignationStudent) // safe by factory path

		// โมเดลนี้มี Validate() แล้ว
		if err := req.Validate(); err != nil {
			return fmt.Errorf("failed to validate resignation request: %w", err)
		}
		if err := tx.Create(req).Error; err != nil {
			return fmt.Errorf("failed to insert resignation request: %w", err)
		}
		return nil
	})
}

func (c *ResignationStudentHRController) ReviewStudentResignRequest(requestID, action, reason string) error {
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

func (ctl *ResignationStudentHRController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/resignation-student-requests", Method: core.GET, Handler: ctl.HandleList},
		{Route: "/hr/resignation-student-requests/:id", Method: core.GET, Handler: ctl.HandleGetByID},
		{Route: "/hr/resignation-student-requests", Method: core.POST, Handler: ctl.HandleCreate},
		{Route: "/hr/resignation-student-requests/:id/review", Method: core.POST, Handler: ctl.HandleReview},
	}
}

func (ctl *ResignationStudentHRController) HandleList(c *fiber.Ctx) error {
	rows, err := ctl.getAll(c.QueryInt("limit"), c.QueryInt("offset"))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(rows)
}

func (ctl *ResignationStudentHRController) HandleGetByID(c *fiber.Ctx) error {
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

func (ctl *ResignationStudentHRController) HandleCreate(c *fiber.Ctx) error {
	var body struct {
		StudentCode string `json:"StudentCode"`
		Reason      string `json:"Reason"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if body.StudentCode == "" || body.Reason == "" {
		return fiber.NewError(fiber.StatusBadRequest, "StudentCode and Reason are required")
	}
	if err := ctl.SubmitResignationStudent(body.StudentCode, body.Reason); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "resignation submitted"})
}

func (ctl *ResignationStudentHRController) HandleReview(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Action string `json:"action"` // "approve" | "reject"
		Reason string `json:"reason"` // ใช้เมื่อ reject
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if err := ctl.ReviewStudentResignRequest(id, body.Action, body.Reason); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "updated"})
}

func (ctl *ResignationStudentHRController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&model.RequestResignationStudent{})
}
