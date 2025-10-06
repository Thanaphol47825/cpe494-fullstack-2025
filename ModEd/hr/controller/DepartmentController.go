package controller

import (
	"ModEd/common/model"
	"ModEd/core"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type DepartmentController struct {
	application *core.ModEdApplication
}

func NewDepartmentController() *DepartmentController { return &DepartmentController{} }

// health
func (ctl *DepartmentController) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Department API is up")
}

// NOTE: core มีแค่ GET/POST → ใช้ POST สำหรับ update/delete
func (ctl *DepartmentController) GetRoute() []*core.RouteItem {
	return []*core.RouteItem{
		{Route: "/hr/departments", Method: core.GET, Handler: ctl.List},
		{Route: "/hr/departments/:name", Method: core.GET, Handler: ctl.GetByName},
		{Route: "/hr/departments", Method: core.POST, Handler: ctl.Create},

		{Route: "/hr/departments/:name/update", Method: core.POST, Handler: ctl.UpdateByName},
		{Route: "/hr/departments/:name/delete", Method: core.POST, Handler: ctl.DeleteByName},

		{Route: "/hr/Department", Method: core.GET, Handler: ctl.RenderMain},
	}
}

func (ctl *DepartmentController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (ctl *DepartmentController) SetApplication(app *core.ModEdApplication) {
	ctl.application = app
}

// ================= Handlers =================

// GET /hr/departments?limit=&offset=
func (ctl *DepartmentController) List(c *fiber.Ctx) error {
	var rows []map[string]interface{}
	tx := ctl.application.DB.Table("departments")
	if l := c.QueryInt("limit"); l > 0 {
		tx = tx.Limit(l)
	}
	if o := c.QueryInt("offset"); o > 0 {
		tx = tx.Offset(o)
	}
	if err := tx.Find(&rows).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(rows)
}

// GET /hr/departments/:name
// รองรับคอลัมน์ชื่อ name
func (ctl *DepartmentController) GetByName(c *fiber.Ctx) error {
	name := c.Params("name")
	var row map[string]interface{}
	q := ctl.application.DB.Table("departments").
		Where("name = ?", strings.Replace(name, "%20", " ", -1)).
		Take(&row)
	if err := q.Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(http.StatusNotFound, "department not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusOK).JSON(row)
}

// POST /hr/departments
// รับ JSON เป็น map ตามชื่อคอลัมน์ในตาราง (ยืดหยุ่นกับสคีมาที่มีอยู่)
func (ctl *DepartmentController) Create(c *fiber.Ctx) error {
	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	// กันพลาด: ไม่ให้เปลี่ยนแปลงคีย์ระบบ เช่น id
	delete(payload, "id")
	if err := ctl.application.DB.Table("departments").Create(&payload).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	return c.Status(http.StatusCreated).JSON(payload)
}

// POST /hr/departments/:code/update
// อัปเดตด้วย map เฉพาะฟิลด์ที่ส่งมา และกันไม่ให้แก้รหัสแผนก
func (ctl *DepartmentController) UpdateByName(c *fiber.Ctx) error {
	name := strings.TrimSpace(c.Params("name"))

	var patch map[string]interface{}
	if err := c.BodyParser(&patch); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	// หาตัวแรกที่ตรง name
	var dept model.Department
	if err := ctl.application.DB.
		Where("name = ?", strings.Replace(name, "%20", " ", -1)).
		First(&dept).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(http.StatusNotFound, "department not found")
		}
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	// update เฉพาะตัวนี้
	if err := ctl.application.DB.Model(&dept).Updates(patch).Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"updated": true, "id": dept.ID})
}

// POST /hr/departments/:code/delete
func (ctl *DepartmentController) DeleteByName(c *fiber.Ctx) error {
	name := c.Params("name")
	// ใช้ Exec ตรงๆ เพื่อหลีกเลี่ยงการต้องมี struct
	res := ctl.application.DB.Exec("DELETE FROM departments WHERE name = ?", name)
	if err := res.Error; err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}
	if res.RowsAffected == 0 {
		return fiber.NewError(http.StatusNotFound, "department not found")
	}
	return c.SendStatus(http.StatusNoContent)
}
