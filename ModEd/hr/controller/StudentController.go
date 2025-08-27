package controller

import (
	cmodel "ModEd/common/model"
	"ModEd/core"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type StudentController struct {
	application *core.ModEdApplication
}

func NewStudentController() *StudentController {
	return &StudentController{}
}

func (ctl *StudentController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/students", Method: core.GET, Handler: ctl.ListStudents},
		{Route: "/hr/students/:code", Method: core.GET, Handler: ctl.GetStudentByCode},
		{Route: "/hr/students", Method: core.POST, Handler: ctl.CreateStudent},
		{Route: "/hr/students/:code/update", Method: core.POST, Handler: ctl.UpdateStudentByCode},
		{Route: "/hr/students/:code/delete", Method: core.POST, Handler: ctl.DeleteStudentByCode},
		{Route: "/hr/students/id/:id/delete", Method: core.POST, Handler: ctl.DeleteStudentByID}, // 👈 new
	}
}

func (ctl *StudentController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&cmodel.Student{})
}

// ---------- Handlers ----------

func (ctl *StudentController) ListStudents(c *fiber.Ctx) error {
	var students []cmodel.Student
	tx := ctl.application.DB
	if l := c.QueryInt("limit"); l > 0 {
		tx = tx.Limit(l)
	}
	if o := c.QueryInt("offset"); o > 0 {
		tx = tx.Offset(o)
	}
	if err := tx.Find(&students).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, students)
}

func (ctl *StudentController) GetStudentByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	var s cmodel.Student
	if err := ctl.application.DB.Where("student_code = ?", code).First(&s).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return writeErr(c, http.StatusNotFound, "student not found")
		}
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, s)
}

func (ctl *StudentController) CreateStudent(c *fiber.Ctx) error {
	var payload cmodel.Student
	if err := c.BodyParser(&payload); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}
	if err := payload.Validate(); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}
	if err := ctl.application.DB.Create(&payload).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusCreated, payload)
}

func (ctl *StudentController) UpdateStudentByCode(c *fiber.Ctx) error {
	code := c.Params("code")

	var exist cmodel.Student
	if err := ctl.application.DB.Where("student_code = ?", code).First(&exist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return writeErr(c, http.StatusNotFound, "student not found")
		}
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}

	type reqBody struct {
		StudentCode *string `json:"student_code"`
		FirstName   *string `json:"first_name"`
		LastName    *string `json:"last_name"`
		Email       *string `json:"email"`
		Department  *string `json:"department"`

		StartDate *string `json:"start_date"`
		BirthDate *string `json:"birth_date"`

		Program *int `json:"program"`
		Status  *int `json:"status"`

		Gender      *string `json:"Gender"`
		CitizenID   *string `json:"CitizenID"`
		PhoneNumber *string `json:"PhoneNumber"`
		AdvisorCode *string `json:"AdvisorCode"`
	}

	var in reqBody
	if err := c.BodyParser(&in); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}

	if in.StudentCode != nil {
		exist.StudentCode = *in.StudentCode
	}
	if in.FirstName != nil {
		exist.FirstName = *in.FirstName
	}
	if in.LastName != nil {
		exist.LastName = *in.LastName
	}
	if in.Email != nil {
		exist.Email = *in.Email
	}
	if in.Department != nil {
		exist.Department = *in.Department
	}

	if in.StartDate != nil && *in.StartDate != "" {
		t, err := parseTimeFlexible(*in.StartDate)
		if err != nil {
			return writeErr(c, http.StatusBadRequest, err.Error())
		}
		exist.StartDate = t
	}
	if in.BirthDate != nil && *in.BirthDate != "" {
		t, err := parseTimeFlexible(*in.BirthDate)
		if err != nil {
			return writeErr(c, http.StatusBadRequest, err.Error())
		}
		exist.BirthDate = t
	}

	if in.Program != nil {
		exist.Program = cmodel.ProgramType(*in.Program)
	}
	if in.Status != nil {
		if in.Status == nil {
		} else {
			st := cmodel.StudentStatus(*in.Status)
			exist.Status = &st
		}
	}

	if in.Gender != nil {
		exist.Gender = in.Gender
	}
	if in.CitizenID != nil {
		exist.CitizenID = in.CitizenID
	}
	if in.PhoneNumber != nil {
		exist.PhoneNumber = in.PhoneNumber
	}
	if in.AdvisorCode != nil {
		exist.AdvisorCode = in.AdvisorCode
	}

	if err := exist.Validate(); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}
	if err := ctl.application.DB.Save(&exist).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, exist)
}

func (ctl *StudentController) DeleteStudentByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	if err := ctl.application.DB.Where("student_code = ?", code).
		Delete(&cmodel.Student{}).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, fiber.Map{"deleted": true, "student_code": code})
}

func (ctl *StudentController) DeleteStudentByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil || id == 0 {
		return writeErr(c, http.StatusBadRequest, "invalid id")
	}
	if err := ctl.application.DB.Where("id = ?", id).
		Delete(&cmodel.Student{}).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusOK, fiber.Map{"deleted": true, "id": id})
}
func parseTimeFlexible(s string) (time.Time, error) {
	if t, err := time.Parse("2006-01-02", s); err == nil {
		return t, nil
	}
	if t, err := time.Parse(time.RFC3339, s); err == nil {
		return t, nil
	}
	return time.Time{}, fmt.Errorf("invalid time format: %s (expect YYYY-MM-DD or RFC3339)", s)
}
