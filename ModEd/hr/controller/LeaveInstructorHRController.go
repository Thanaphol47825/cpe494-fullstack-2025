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

// -------- HTTP --------

func (ctl *LeaveInstructorHRController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/leave-instructor-requests", Method: core.GET, Handler: ctl.HandleGetAllRequests},
		{Route: "/hr/leave-instructor-requests", Method: core.POST, Handler: ctl.HandleSubmitRequest},
	}
}

func (ctl *LeaveInstructorHRController) HandleGetAllRequests(c *fiber.Ctx) error {
	rs, err := ctl.getAll()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(rs)
}

func (ctl *LeaveInstructorHRController) HandleSubmitRequest(c *fiber.Ctx) error {
	// รับได้ทั้ง 2 รูปแบบ: LeaveDate (RFC3339) หรือ DateStr (YYYY-MM-DD)
	var body struct {
		InstructorCode string     `json:"InstructorCode"`
		LeaveType      string     `json:"LeaveType"`
		Reason         string     `json:"Reason"`
		LeaveDate      *time.Time `json:"LeaveDate"` // optional
		DateStr        string     `json:"DateStr"`   // optional
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	// สร้าง dateStr แบบกันตาย
	dateStr := body.DateStr
	if dateStr == "" && body.LeaveDate != nil {
		dateStr = body.LeaveDate.Format("2006-01-02")
	}

	// ตรวจค่าว่างให้ครบก่อนส่งเข้า factory (จะได้ไม่เจอ 500)
	if body.InstructorCode == "" || body.LeaveType == "" || body.Reason == "" || dateStr == "" {
		return fiber.NewError(fiber.StatusBadRequest, "InstructorCode, LeaveType, Reason, and LeaveDate/DateStr are required")
	}

	if err := ctl.SubmitInstructorLeaveRequest(body.InstructorCode, body.LeaveType, body.Reason, dateStr); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Leave request submitted successfully"})
}

func (ctl *LeaveInstructorHRController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&model.RequestLeaveInstructor{})
}
