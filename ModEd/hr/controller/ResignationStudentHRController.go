package controller

import (
	"ModEd/core"
	"ModEd/hr/model"
	"ModEd/hr/util"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type ResignationStudentHRController struct {
	application *core.ModEdApplication
}

func (ctl *ResignationStudentHRController) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(ctl.application.RootPath, "hr", "view", "ResignationStudent.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Create Request",
		"RootURL": ctl.application.RootURL,
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func NewResignationStudentHRController() *ResignationStudentHRController {
	return &ResignationStudentHRController{}
}

func (c *ResignationStudentHRController) insert(req *model.RequestResignationStudent) error {
	return c.application.DB.Create(req).Error
}

func (c *ResignationStudentHRController) delete(req *model.RequestResignationStudent) error {
	return c.application.DB.Delete(req).Error
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

func (c *ResignationStudentHRController) SubmitResignationStudent(studentID, reason string) (*model.RequestResignationStudent, error) {
	tm := &util.TransactionManager{DB: c.application.DB}
	var row *model.RequestResignationStudent
	err := tm.Execute(func(tx *gorm.DB) error {
		params := model.CreateRequestParams{
			ID:     studentID,
			Reason: reason,
		}
		reqIface, err := (model.RequestFactory{}).CreateRequest(model.RoleStudent, model.RequestTypeResignation, params)
		if err != nil {
			return fmt.Errorf("failed to create resignation request using factory: %w", err)
		}
		req := reqIface.(*model.RequestResignationStudent)

		if err := req.Validate(); err != nil {
			return fmt.Errorf("failed to validate resignation request: %w", err)
		}
		if err := tx.Create(req).Error; err != nil {
			return fmt.Errorf("failed to insert resignation request: %w", err)
		}
		row = req
		return nil
	})
	return row, err
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

func (ctl *ResignationStudentHRController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/resignation-student-requests/create", Method: core.GET, Handler: ctl.RenderCreateForm},
		{Route: "/hr/resignation-student-requests", Method: core.GET, Handler: ctl.HandleList},
		{Route: "/hr/resignation-student-requests/:id", Method: core.GET, Handler: ctl.HandleGetByID},
		{Route: "/hr/resignation-student-requests", Method: core.POST, Handler: ctl.HandleCreate},
		{Route: "/hr/resignation-student-requests/:id/review", Method: core.POST, Handler: ctl.HandleReview},
		{Route: "/hr/resignation-student-requests/:id/delete", Method: core.POST, Handler: ctl.HandleDelete},
	}
}

func (ctl *ResignationStudentHRController) HandleList(c *fiber.Ctx) error {
	rows, err := ctl.getAll(c.QueryInt("limit"), c.QueryInt("offset"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    rows,
	})
}

func (ctl *ResignationStudentHRController) HandleGetByID(c *fiber.Ctx) error {
	id64, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid id"},
		})
	}
	row, err := ctl.getByID(uint(id64))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 404, "message": err.Error()},
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    row,
	})
}

func (ctl *ResignationStudentHRController) HandleCreate(c *fiber.Ctx) error {
	var body struct {
		StudentCode string `json:"StudentCode"`
		Reason      string `json:"Reason"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request body"},
		})
	}
	if body.StudentCode == "" || body.Reason == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "StudentCode and Reason are required"},
		})
	}
	row, err := ctl.SubmitResignationStudent(body.StudentCode, body.Reason)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    row,
	})
}

func (ctl *ResignationStudentHRController) HandleReview(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Action string `json:"action"` // "approve" | "reject"
		Reason string `json:"reason"` // ใช้เมื่อ reject
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request body"},
		})
	}
	if err := ctl.ReviewStudentResignRequest(id, body.Action, body.Reason); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": err.Error()},
		})
	}
	id64, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid id"},
		})
	}
	row, err := ctl.getByID(uint(id64))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 404, "message": err.Error()},
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    row,
	})
}

func (ctl *ResignationStudentHRController) HandleDelete(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	if c.Params("id") == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "id is required"},
		})
	}

	row, err := ctl.getByID(uint(id64))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 404, "message": "record not found"},
		})
	}

	if err := ctl.delete(row); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    row,
	})
}

func (ctl *ResignationStudentHRController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (ctl *ResignationStudentHRController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&model.RequestResignationStudent{})
}
