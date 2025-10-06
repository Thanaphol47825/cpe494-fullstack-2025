package controller

import (
	cmodel "ModEd/common/model"
	"ModEd/core"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"path/filepath"

	"github.com/hoisie/mustache"
)

type StudentController struct {
	application *core.ModEdApplication
}

func (ctl *StudentController) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(ctl.application.RootPath, "hr", "view", "StudentForm.tpl")
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
		"title":   "Create Student",
		"RootURL": ctl.application.RootURL,
		"modules": string(modulesJSON),
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}
func NewStudentController() *StudentController {
	return &StudentController{}
}

func (ctl *StudentController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/students/create", Method: core.GET, Handler: ctl.RenderCreateForm},

		{Route: "/hr/students", Method: core.GET, Handler: ctl.ListStudents},
		{Route: "/hr/students", Method: core.POST, Handler: ctl.CreateStudent},

		{Route: "/hr/students/:code/update", Method: core.POST, Handler: ctl.UpdateStudentByCode},
		{Route: "/hr/students/:code/delete", Method: core.POST, Handler: ctl.DeleteStudentByCode},
		{Route: "/hr/students/:code", Method: core.GET, Handler: ctl.GetStudentByCode},
		{Route: "/hr/students/id/:id/delete", Method: core.POST, Handler: ctl.DeleteStudentByID},
	}
}

func (ctl *StudentController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
	_ = ctl.application.DB.AutoMigrate(&cmodel.Student{})

	// Set up dynamic form metadata API
	ctl.application.SetAPIform("student", &cmodel.Student{})
}

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
	type reqBody struct {
		StudentCode string  `json:"student_code"`
		FirstName   string  `json:"first_name"`
		LastName    string  `json:"last_name"`
		Email       string  `json:"email"`
		Department  string  `json:"department"`
		StartDate   *string `json:"start_date"`
		BirthDate   *string `json:"birth_date"`
		Program     *int    `json:"program"`
		Status      *int    `json:"status"`
		Gender      *string `json:"Gender"`
		CitizenID   *string `json:"CitizenID"`
		PhoneNumber *string `json:"PhoneNumber"`
		AdvisorCode *string `json:"AdvisorCode"`
	}
	var in reqBody
	if err := c.BodyParser(&in); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}

	var start time.Time
	var birth time.Time
	var err error

	if in.StartDate != nil && *in.StartDate != "" {
		start, err = parseTimeFlexible(*in.StartDate)
		if err != nil {
			return writeErr(c, http.StatusBadRequest, err.Error())
		}
	} else {
		start = time.Time{}
	}

	if in.BirthDate != nil && *in.BirthDate != "" {
		birth, err = parseTimeFlexible(*in.BirthDate)
		if err != nil {
			return writeErr(c, http.StatusBadRequest, err.Error())
		}
	} else {
		birth = time.Time{}
	}

	out := cmodel.Student{
		StudentCode: in.StudentCode,
		FirstName:   in.FirstName,
		LastName:    in.LastName,
		Email:       in.Email,
		StartDate:   start,
		BirthDate:   birth,
		Department:  in.Department,
	}

	if in.Program != nil {
		out.Program = cmodel.ProgramType(*in.Program)
	}
	if in.Status != nil {
		st := cmodel.StudentStatus(*in.Status)
		out.Status = &st
	}
	if in.Gender != nil {
		out.Gender = in.Gender
	}
	if in.CitizenID != nil {
		out.CitizenID = in.CitizenID
	}
	if in.PhoneNumber != nil {
		out.PhoneNumber = in.PhoneNumber
	}
	if in.AdvisorCode != nil {
		out.AdvisorCode = in.AdvisorCode
	}

	if err := out.Validate(); err != nil {
		return writeErr(c, http.StatusBadRequest, err.Error())
	}
	if err := ctl.application.DB.Create(&out).Error; err != nil {
		return writeErr(c, http.StatusInternalServerError, err.Error())
	}
	return writeOK(c, http.StatusCreated, out)
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
		StartDate   *string `json:"start_date"`
		BirthDate   *string `json:"birth_date"`
		Program     *int    `json:"program"`
		Status      *int    `json:"status"`
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
		st := cmodel.StudentStatus(*in.Status)
		exist.Status = &st
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
	if err := ctl.application.DB.Where("student_code = ?", code).Delete(&cmodel.Student{}).Error; err != nil {
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
	if err := ctl.application.DB.Where("id = ?", id).Delete(&cmodel.Student{}).Error; err != nil {
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
