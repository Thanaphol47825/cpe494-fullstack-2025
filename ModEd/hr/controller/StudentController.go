package controller

import (
	"ModEd/core"
	"ModEd/hr/model"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type StudentController struct {
	application *core.ModEdApplication
}

func NewStudentController() *StudentController {
	return &StudentController{}
}

// ping/health
func (ctl *StudentController) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Student HR API is up")
}

// core.Application จะเรียกเมธอดนี้เพื่อลงทะเบียนเส้นทาง
// NOTE: core ตอนนี้รองรับแค่ GET/POST -> จึงใช้ POST สำหรับ update/delete ชั่วคราว
func (ctl *StudentController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/students", Method: core.GET, Handler: ctl.ListStudents},
		{Route: "/hr/students/:code", Method: core.GET, Handler: ctl.GetStudentByCode},
		{Route: "/hr/students", Method: core.POST, Handler: ctl.CreateStudent},

		// ใช้ POST ชั่วคราวแทน PUT/DELETE
		{Route: "/hr/students/:code/update", Method: core.POST, Handler: ctl.UpdateStudentByCode},
		{Route: "/hr/students/:code/delete", Method: core.POST, Handler: ctl.DeleteStudentByCode},

		// endpoint เดิมของคุณ
		{Route: "/hr/Student", Method: core.GET, Handler: ctl.RenderMain},
	}
}

// รับ Application แล้วเตรียม dependency
func (ctl *StudentController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	ctl.application.DB = app.DB

	// เผื่อ schema ยังไม่ถูกสร้าง
	_ = ctl.application.DB.AutoMigrate(&model.StudentInfo{})
}

// ================= Handlers =================

// GET /hr/students?limit=&offset=
func (ctl *StudentController) ListStudents(c *fiber.Ctx) error {
	var students []model.StudentInfo
	tx := ctl.application.DB
	if l := c.QueryInt("limit"); l > 0 {
		tx = tx.Limit(l)
	}
	if o := c.QueryInt("offset"); o > 0 {
		tx = tx.Offset(o)
	}
	if err := tx.Find(&students).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(students)
}

// GET /hr/students/:code
func (ctl *StudentController) GetStudentByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	var s model.StudentInfo
	if err := ctl.application.DB.Where("student_code = ?", code).First(&s).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(http.StatusNotFound, "student not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(s)
}

// POST /hr/students
func (ctl *StudentController) CreateStudent(c *fiber.Ctx) error {
	var payload model.StudentInfo
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := payload.Validate(); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := ctl.application.DB.Create(&payload).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusCreated).JSON(payload)
}

// POST /hr/students/:code/update   (แทน PUT ชั่วคราว)
func (ctl *StudentController) UpdateStudentByCode(c *fiber.Ctx) error {
	code := c.Params("code")

	var exist model.StudentInfo
	if err := ctl.application.DB.Where("student_code = ?", code).First(&exist).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(http.StatusNotFound, "student not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	var req struct {
		FirstName   string `json:"FirstName"`
		LastName    string `json:"LastName"`
		Gender      string `json:"Gender"`
		CitizenID   string `json:"CitizenID"`
		PhoneNumber string `json:"PhoneNumber"`
		Email       string `json:"Email"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	updated := model.NewUpdatedStudentInfo(&exist,
		req.FirstName, req.LastName, req.Gender, req.CitizenID, req.PhoneNumber, req.Email)

	if err := updated.Validate(); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	if err := ctl.application.DB.Model(&exist).Updates(updated).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(updated)
}

// POST /hr/students/:code/delete   (แทน DELETE ชั่วคราว)
func (ctl *StudentController) DeleteStudentByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	if err := ctl.application.DB.Where("student_code = ?", code).Delete(&model.StudentInfo{}).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.SendStatus(http.StatusNoContent)
}
