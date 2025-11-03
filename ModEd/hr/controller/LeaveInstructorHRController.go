package controller

import (
	"ModEd/core"
	"ModEd/hr/model"
	"ModEd/hr/util"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type LeaveInstructorHRController struct {
	application *core.ModEdApplication
}

func NewLeaveInstructorHRController() *LeaveInstructorHRController {
	return &LeaveInstructorHRController{}
}

func (c *LeaveInstructorHRController) insert(r *model.RequestLeaveInstructor) error {
	return c.application.DB.Create(r).Error
}
func (c *LeaveInstructorHRController) update(r *model.RequestLeaveInstructor) error {
	return c.application.DB.Save(r).Error
}
func (c *LeaveInstructorHRController) delete(r *model.RequestLeaveInstructor) error {
	return c.application.DB.Delete(r).Error
}

func (c *LeaveInstructorHRController) getAll() ([]*model.RequestLeaveInstructor, error) {
	var rs []*model.RequestLeaveInstructor
	return rs, c.application.DB.Find(&rs).Error
}
func (c *LeaveInstructorHRController) getByID(id uint) (*model.RequestLeaveInstructor, error) {
	var r model.RequestLeaveInstructor
	return &r, c.application.DB.First(&r, id).Error
}

func (c *LeaveInstructorHRController) SubmitInstructorLeaveRequest(instructorID, leaveType, reason, dateStr string) error {
	tm := &util.TransactionManager{DB: c.application.DB}
	return tm.Execute(func(tx *gorm.DB) error {
		params := model.CreateRequestParams{
			ID:        instructorID,
			LeaveType: leaveType,
			Reason:    reason,
			DateStr:   dateStr, // YYYY-MM-DD
		}
		reqInterface, err := (model.RequestFactory{}).CreateRequest(model.RoleInstructor, model.RequestTypeLeave, params)
		if err != nil {
			return fmt.Errorf("failed to create leave request using factory: %w", err)
		}
		req := reqInterface.(*model.RequestLeaveInstructor) // safe by factory path

		if err := req.Validate(); err != nil {
			return fmt.Errorf("failed to validate: %w", err)
		}
		if err := tx.Create(req).Error; err != nil {
			return fmt.Errorf("failed to insert: %w", err)
		}
		return nil
	})
}

func (c *LeaveInstructorHRController) ReviewInstructorLeaveRequest(requestID, action, reason string) error {
	return ReviewRequest(
		requestID,
		action,
		reason,
		// fetch
		func(id uint) (Reviewable, error) {
			return c.getByID(id)
		},
		// save
		func(r Reviewable) error {
			return c.application.DB.Save(r).Error
		},
	)
}

// -------- HTTP --------

func (ctl *LeaveInstructorHRController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/leave-instructor-requests", Method: core.GET, Handler: ctl.HandleGetAllRequests},
		{Route: "/api/data/hr/leave-instructor-requests", Method: core.GET, Handler: ctl.HandleGetAllRequests},
		{Route: "/hr/leave-instructor-requests/:id", Method: core.GET, Handler: ctl.HandleGetRequestByID},
		{Route: "/hr/leave-instructor-requests", Method: core.POST, Handler: ctl.HandleSubmitRequest},
		{Route: "/hr/leave-instructor-requests/:id/review", Method: core.POST, Handler: ctl.HandleReviewRequest},
		{Route: "/hr/leave-instructor-requests/update", Method: core.POST, Handler: ctl.HandleUpdateRequest},
		{Route: "/hr/leave-instructor-requests/delete", Method: core.POST, Handler: ctl.HandleDeleteRequest},
	}
}

func (ctl *LeaveInstructorHRController) HandleGetAllRequests(c *fiber.Ctx) error {
	rs, err := ctl.getAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    rs,
	})
}

func (ctl *LeaveInstructorHRController) HandleGetRequestByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request ID"},
		})
	}
	req, err := ctl.getByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    req,
	})
}

func (ctl *LeaveInstructorHRController) HandleSubmitRequest(c *fiber.Ctx) error {
	var body struct {
		InstructorCode string     `json:"InstructorCode"`
		LeaveType      string     `json:"LeaveType"`
		Reason         string     `json:"Reason"`
		LeaveDate      *time.Time `json:"LeaveDate"`
		DateStr        string     `json:"DateStr"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request body"},
		})
	}

	dateStr := body.DateStr
	if dateStr == "" && body.LeaveDate != nil {
		dateStr = body.LeaveDate.Format("2006-01-02")
	}

	if body.InstructorCode == "" || body.LeaveType == "" || body.Reason == "" || dateStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "InstructorCode, LeaveType, Reason, and LeaveDate/DateStr are required"},
		})
	}

	if err := ctl.SubmitInstructorLeaveRequest(body.InstructorCode, body.LeaveType, body.Reason, dateStr); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    fiber.Map{"message": "Leave request submitted successfully"},
	})
}

func (ctl *LeaveInstructorHRController) HandleReviewRequest(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request ID"},
		})
	}

	var body struct {
		Action string `json:"action"` // "approve" or "reject"
		Reason string `json:"reason"` // optional
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request body"},
		})
	}
	if body.Action != "approve" && body.Action != "reject" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "action must be 'approve' or 'reject'"},
		})
	}

	if err := ctl.ReviewInstructorLeaveRequest(fmt.Sprintf("%d", id), body.Action, body.Reason); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    fiber.Map{"message": "Leave request reviewed successfully"},
	})
}

func (ctl *LeaveInstructorHRController) HandleUpdateRequest(c *fiber.Ctx) error {
	var body struct {
		ID        uint   `json:"id"`
		Status    string `json:"status"`
		Reason    string `json:"reason"`
		LeaveType string `json:"leave_type"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request body"},
		})
	}
	if body.ID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "id is required"},
		})
	}

	// หาเรคคอร์ด
	req, err := ctl.getByID(body.ID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 404, "message": "record not found"},
		})
	}

	// อัปเดตเฉพาะฟิลด์ที่ส่งมา
	if body.Status != "" {
		req.Status = body.Status
	}
	if body.Reason != "" {
		req.Reason = body.Reason
	}
	if body.LeaveType != "" {
		req.LeaveType = model.LeaveType(body.LeaveType)
	}

	// บันทึก
	if err := ctl.update(req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    req,
	})
}

func (ctl *LeaveInstructorHRController) HandleDeleteRequest(c *fiber.Ctx) error {
	var body struct {
		ID uint `json:"id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "invalid request body"},
		})
	}
	if body.ID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 400, "message": "id is required"},
		})
	}

	// หาเรคคอร์ด
	req, err := ctl.getByID(body.ID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 404, "message": "record not found"},
		})
	}

	// ลบ
	if err := ctl.delete(req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     fiber.Map{"code": 500, "message": err.Error()},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"isSuccess": true,
		"result":    fiber.Map{"message": "deleted successfully"},
	})
}

func (ctl *LeaveInstructorHRController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "hr/RequestLeaveInstructor", Model: &model.RequestLeaveInstructor{}},
	}
}

func (ctl *LeaveInstructorHRController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&model.RequestLeaveInstructor{})
}
