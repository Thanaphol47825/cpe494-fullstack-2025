package controller

import (
	cmodel "ModEd/common/model" // instructors (ตารางฐาน)
	"ModEd/core"
	hrmodel "ModEd/hr/model" // instructor_infos
	"errors"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InstructorController struct {
	application *core.ModEdApplication
}

func NewInstructorController() *InstructorController { return &InstructorController{} }

func (ctl *InstructorController) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Instructor HR API is up")
}

func (ctl *InstructorController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/instructors", Method: core.GET, Handler: ctl.List},
		{Route: "/hr/instructors/:code", Method: core.GET, Handler: ctl.GetByCode},
		{Route: "/hr/instructors", Method: core.POST, Handler: ctl.Create},

		// core รองรับเฉพาะ GET/POST -> ใช้ POST สำหรับ update/delete
		{Route: "/hr/instructors/:code/update", Method: core.POST, Handler: ctl.UpdateByCode},
		{Route: "/hr/instructors/:code/delete", Method: core.POST, Handler: ctl.DeleteByCode},

		{Route: "/hr/Instructor", Method: core.GET, Handler: ctl.RenderMain},
	}
}

func (ctl *InstructorController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&hrmodel.InstructorInfo{}) // instructor_infos
	_ = ctl.application.DB.AutoMigrate(&cmodel.Instructor{})      // instructors (ฐาน)
}

// -------- Handlers --------

func (ctl *InstructorController) List(c *fiber.Ctx) error {
	var out []hrmodel.InstructorInfo
	tx := ctl.application.DB
	if l := c.QueryInt("limit"); l > 0 {
		tx = tx.Limit(l)
	}
	if o := c.QueryInt("offset"); o > 0 {
		tx = tx.Offset(o)
	}
	if err := tx.Find(&out).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(out)
}

func (ctl *InstructorController) GetByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	var rec hrmodel.InstructorInfo
	if err := ctl.application.DB.Where("instructor_code = ?", code).First(&rec).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(http.StatusNotFound, "instructor not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(rec)
}

// CREATE: เขียนลง instructor_infos และ upsert ลง instructors (ฐาน) ภายใน transaction
func (ctl *InstructorController) Create(c *fiber.Ctx) error {
	var payload hrmodel.InstructorInfo
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	// รองรับตำแหน่งเป็น "คำ"
	var pos struct {
		AcademicPosition   string `json:"AcademicPosition"`
		DepartmentPosition string `json:"DepartmentPosition"`
	}
	_ = c.BodyParser(&pos)
	if pos.AcademicPosition != "" {
		v, err := hrmodel.ParseAcademicPosition(pos.AcademicPosition)
		if err != nil {
			return fiber.NewError(http.StatusBadRequest, err.Error())
		}
		payload.AcademicPosition = v
	}
	if pos.DepartmentPosition != "" {
		v, err := hrmodel.ParseDepartmentPosition(pos.DepartmentPosition)
		if err != nil {
			return fiber.NewError(http.StatusBadRequest, err.Error())
		}
		payload.DepartmentPosition = v
	}

	if err := payload.Validate(); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	err := ctl.application.DB.Transaction(func(tx *gorm.DB) error {
		// upsert ตารางฐาน
		var base cmodel.Instructor
		err := tx.Where("instructor_code = ?", payload.InstructorCode).First(&base).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			base = cmodel.Instructor{
				InstructorCode: payload.InstructorCode,
				FirstName:      payload.FirstName,
				LastName:       payload.LastName,
				Email:          payload.Email,
				StartDate:      payload.StartDate,
				Department:     payload.Department,
			}
			if err := tx.Create(&base).Error; err != nil {
				return err
			}
		} else if err == nil {
			base.FirstName = payload.FirstName
			base.LastName = payload.LastName
			base.Email = payload.Email
			base.StartDate = payload.StartDate
			base.Department = payload.Department
			if err := tx.Save(&base).Error; err != nil {
				return err
			}
		} else {
			return err
		}

		// create info
		if err := tx.Create(&payload).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusCreated).JSON(payload)
}

// UPDATE: อัปเดต instructor_infos + ซิงก์ instructors
func (ctl *InstructorController) UpdateByCode(c *fiber.Ctx) error {
	code := c.Params("code")

	var exist hrmodel.InstructorInfo
	if err := ctl.application.DB.Where("instructor_code = ?", code).First(&exist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(http.StatusNotFound, "instructor not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	type updateReq struct {
		FirstName          *string  `json:"first_name"`
		LastName           *string  `json:"last_name"`
		Email              *string  `json:"email"`
		Department         *string  `json:"department"`
		Gender             *string  `json:"Gender"`
		CitizenID          *string  `json:"CitizenID"`
		PhoneNumber        *string  `json:"PhoneNumber"`
		Salary             *float64 `json:"Salary"`
		AcademicPosition   *string  `json:"AcademicPosition"`
		DepartmentPosition *string  `json:"DepartmentPosition"`
		// เปิดเพิ่มถ้าจะให้แก้ start_date:
		// StartDate *time.Time `json:"start_date"`
	}
	var req updateReq
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	// apply partial
	if req.FirstName != nil {
		exist.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		exist.LastName = *req.LastName
	}
	if req.Email != nil {
		exist.Email = *req.Email
	}
	if req.Department != nil {
		exist.Department = req.Department
	}
	if req.Gender != nil {
		exist.Gender = *req.Gender
	}
	if req.CitizenID != nil {
		exist.CitizenID = *req.CitizenID
	}
	if req.PhoneNumber != nil {
		exist.PhoneNumber = *req.PhoneNumber
	}
	if req.Salary != nil {
		exist.Salary = *req.Salary
	}
	if req.AcademicPosition != nil && *req.AcademicPosition != "" {
		v, err := hrmodel.ParseAcademicPosition(*req.AcademicPosition)
		if err != nil {
			return fiber.NewError(http.StatusBadRequest, err.Error())
		}
		exist.AcademicPosition = v
	}
	if req.DepartmentPosition != nil && *req.DepartmentPosition != "" {
		v, err := hrmodel.ParseDepartmentPosition(*req.DepartmentPosition)
		if err != nil {
			return fiber.NewError(http.StatusBadRequest, err.Error())
		}
		exist.DepartmentPosition = v
	}
	// if req.StartDate != nil { exist.StartDate = *req.StartDate }

	if err := exist.Validate(); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	err := ctl.application.DB.Transaction(func(tx *gorm.DB) error {
		// update info
		if err := tx.Model(&hrmodel.InstructorInfo{}).
			Where("instructor_code = ?", code).
			Updates(exist).Error; err != nil {
			return err
		}

		// sync base
		var base cmodel.Instructor
		err := tx.Where("instructor_code = ?", code).First(&base).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			base = cmodel.Instructor{
				InstructorCode: exist.InstructorCode,
				FirstName:      exist.FirstName,
				LastName:       exist.LastName,
				Email:          exist.Email,
				StartDate:      exist.StartDate,
				Department:     exist.Department,
			}
			return tx.Create(&base).Error
		} else if err == nil {
			base.FirstName = exist.FirstName
			base.LastName = exist.LastName
			base.Email = exist.Email
			base.Department = exist.Department
			// base.StartDate = exist.StartDate // เปิดถ้าจะ sync start_date
			return tx.Save(&base).Error
		} else {
			return err
		}
	})
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(exist)
}

// ลบเฉพาะใน instructor_infos (ยังไม่ลบจาก instructors เพื่อกัน FK ที่ student_infos.AdvisorCode)
func (ctl *InstructorController) DeleteByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	if err := ctl.application.DB.Where("instructor_code = ?", code).
		Delete(&hrmodel.InstructorInfo{}).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.SendStatus(http.StatusNoContent)
}
