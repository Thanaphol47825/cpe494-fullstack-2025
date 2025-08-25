package controller

import (
	"ModEd/core"
	"ModEd/hr/model"
	"ModEd/hr/util"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type LeaveStudentHRController struct {
	application *core.ModEdApplication
}

func NewLeaveStudentHRController() *LeaveStudentHRController {
	return &LeaveStudentHRController{}
}

func (c *LeaveStudentHRController) insert(request *model.RequestLeaveStudent) error {
	return c.application.DB.Create(request).Error
}

func (c *LeaveStudentHRController) update(request *model.RequestLeaveStudent) error {
	return c.application.DB.Save(request).Error
}

func (c *LeaveStudentHRController) delete(request *model.RequestLeaveStudent) error {
	return c.application.DB.Delete(request).Error
}

func (c *LeaveStudentHRController) getAll() ([]*model.RequestLeaveStudent, error) {
	var requests []*model.RequestLeaveStudent
	err := c.application.DB.Find(&requests).Error
	if err != nil {
		return nil, err
	}
	return requests, nil
}

func (c *LeaveStudentHRController) getByID(id uint) (*model.RequestLeaveStudent, error) {
	var request model.RequestLeaveStudent
	err := c.application.DB.First(&request, id).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}
func (c *LeaveStudentHRController) getByStudentID(studentID string) ([]model.RequestLeaveStudent, error) {
	var requests []model.RequestLeaveStudent
	err := c.application.DB.Where("student_code = ?", studentID).Find(&requests).Error
	if err != nil {
		return nil, err
	}
	return requests, nil
}

func (c *LeaveStudentHRController) SubmitStudentLeaveRequest(studentID, leaveType, reason, leaveDateStr string) error {

	tm := &util.TransactionManager{DB: c.application.DB}

	return tm.Execute(func(tx *gorm.DB) error {
		leaveController := NewLeaveStudentHRController()

		requestFactory := model.RequestFactory{}

		params := model.CreateRequestParams{
			ID:        studentID,
			LeaveType: leaveType,
			Reason:    reason,
			DateStr:   leaveDateStr,
		}

		reqInterface, err := requestFactory.CreateRequest(model.RoleInstructor, model.RequestTypeLeave, params)

		if err != nil {
			return fmt.Errorf("failed to create leave request using factory: %v", err)
		}

		req, ok := reqInterface.(*model.RequestLeaveStudent)

		err = req.Validate()
		if err != nil {
			return fmt.Errorf("failed to validate leave request: %v", err)
		}

		if !ok {
			return fmt.Errorf("factory returned unexpected type for student leave request")
		}

		if err := leaveController.insert(req); err != nil {
			return fmt.Errorf("failed to submit leave request within transaction: %v", err)
		}
		return nil
	})
}

func (c *LeaveStudentHRController) ReviewStudentLeaveRequest(requestID, action, reason string,
) error {
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

func (c *LeaveStudentHRController) ExportStudentLeaveRequests(filePath string) error {
	requests, err := c.getAll()
	if err != nil {
		return fmt.Errorf("failed to retrieve student leave requests: %w", err)
	}

	mapper, err := core.CreateMapper[model.RequestLeaveStudent](filePath)
	if err != nil {
		return fmt.Errorf("failed to create student leave request mapper: %w", err)
	}

	err = mapper.Serialize(requests)
	if err != nil {
		return fmt.Errorf("failed to serialize student leave requests: %w", err)
	}

	fmt.Printf("Exported %d student leave requests to %s\n", len(requests), filePath)
	return nil
}

// Create Route
func (ctl *LeaveStudentHRController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/leave-student-requests", Method: core.GET, Handler: ctl.HandleGetAllRequests},
		// {Route: "/hr/leave-student-requests/:id", Method: core.GET, Handler: ctl.HandleGetRequestByID},
		{Route: "/hr/leave-student-requests", Method: core.POST, Handler: ctl.HandleSubmitRequest},
		// {Route: "/hr/leave-student-requests/:id/review", Method: core.POST, Handler: ctl.HandleReviewRequest},
		// {Route: "/hr/leave-student-requests/export", Method: core.POST, Handler: ctl.HandleExportRequests},
	}
}

func (ctl *LeaveStudentHRController) HandleGetAllRequests(c *fiber.Ctx) error {
	requests, err := ctl.getAll()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusOK).JSON(requests)
}

func (ctl *LeaveStudentHRController) HandleSubmitRequest(c *fiber.Ctx) error {
	var req model.RequestLeaveStudent
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	err := ctl.SubmitStudentLeaveRequest(req.StudentCode, req.LeaveType, req.Reason, req.LeaveDate.Format("2006-01-02"))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Leave request submitted successfully",
	})
}

func (ctl *LeaveStudentHRController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	ctl.application.DB = app.DB

	// เผื่อ schema ยังไม่ถูกสร้าง
	_ = ctl.application.DB.AutoMigrate(&model.RequestLeaveStudent{})
}
