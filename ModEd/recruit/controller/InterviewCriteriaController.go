package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"net/http"
	"path/filepath"
)

type InterviewCriteriaController struct {
	application *core.ModEdApplication
}

func NewInterviewCriteriaController() *InterviewCriteriaController {
	controller := &InterviewCriteriaController{}
	return controller
}

func (controller *InterviewCriteriaController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello recruit/InterviewCriteria")
}

func (controller *InterviewCriteriaController) CreateInterviewCriteria(context *fiber.Ctx) error {
	interviewCriteria := new(model.InterviewCriteria)

	if err := context.BodyParser(interviewCriteria); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(interviewCriteria).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    interviewCriteria,
	})
}

func (controller *InterviewCriteriaController) GetAllInterviewCriteria(context *fiber.Ctx) error {
	var criteriaList []*model.InterviewCriteria

	if err := controller.application.DB.
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		Find(&criteriaList).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    criteriaList,
	})
}

func (controller *InterviewCriteriaController) GetInterviewCriteriaByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var criteria model.InterviewCriteria

	if err := controller.application.DB.
		Preload("ApplicationRound").
		Preload("Faculty").
		Preload("Department").
		First(&criteria, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "InterviewCriteria not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    criteria,
	})
}

type InterviewCriteriaUpdate struct {
	ApplicationRoundsID uint    `json:"application_rounds_id"`
	FacultyID           uint    `json:"faculty_id"`
	DepartmentID        uint    `json:"department_id"`
	PassingScore        float64 `json:"passing_score"`
}

func (controller *InterviewCriteriaController) UpdateInterviewCriteria(context *fiber.Ctx) error {
	id := context.Params("id")
	var criteria model.InterviewCriteria

	if err := controller.application.DB.First(&criteria, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "InterviewCriteria not found",
		})
	}

	var updateData InterviewCriteriaUpdate
	if err := context.BodyParser(&updateData); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if updateData.ApplicationRoundsID != 0 {
		criteria.ApplicationRoundsID = updateData.ApplicationRoundsID
	}
	if updateData.FacultyID != 0 {
		criteria.FacultyID = updateData.FacultyID
	}
	if updateData.DepartmentID != 0 {
		criteria.DepartmentID = updateData.DepartmentID
	}
	if updateData.PassingScore != 0 {
		criteria.PassingScore = updateData.PassingScore
	}

	if err := controller.application.DB.Save(&criteria).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    criteria,
	})
}

func (controller *InterviewCriteriaController) DeleteInterviewCriteria(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.InterviewCriteria{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "InterviewCriteria deleted successfully",
	})
}

func (controller *InterviewCriteriaController) CreateRawSQL(context *fiber.Ctx) error {
    rawSQL := `
    INSERT INTO application_rounds (id, round_name) VALUES (1, 'รอบที่ 1') ON CONFLICT (id) DO NOTHING;
    INSERT INTO faculties (id, name, budget) VALUES (2, 'คณะวิทยาศาสตร์', 100000) ON CONFLICT (id) DO NOTHING;
    INSERT INTO departments (id, name, faculty, budget) VALUES (3, 'ภาควิชาคอมพิวเตอร์', 'คณะวิทยาศาสตร์', 50000) ON CONFLICT (id) DO NOTHING;
    `
    if err := controller.application.DB.Exec(rawSQL).Error; err != nil {
        return context.JSON(fiber.Map{
            "isSuccess": false,
            "result":    err.Error(),
        })
    }

    return context.JSON(fiber.Map{
        "isSuccess": true,
        "result":    "Raw SQL executed successfully (duplicates ignored)",
    })
}

func (controller *InterviewCriteriaController) RenderInterviewCriteriaForm(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "InterviewCriteria.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return context.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	rendered := tmpl.Render(map[string]any{
		"title":   "Create Interview Criteria",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html; charset=utf-8")
	return context.SendString(rendered)
}

func (controller *InterviewCriteriaController) RenderCreateInterviewCriteriaForm(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "InterviewCriteriaCreate.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return context.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	rendered := tmpl.Render(map[string]any{
		"title":   "Create Interview Criteria",
		"RootURL": controller.application.RootURL,
	})
	context.Set("Content-Type", "text/html; charset=utf-8")
	return context.SendString(rendered)
}



// func (controller *InterviewCriteriaController) ReadInterviewCriteriaFromCSV() string {
// 	return
// }

func (controller *InterviewCriteriaController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/InterviewCriteria",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateInterviewCriteria",
		Handler: controller.CreateInterviewCriteria,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetAllInterviewCriteria",
		Handler: controller.GetAllInterviewCriteria,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetInterviewCriteriaByID/:id",
		Handler: controller.GetInterviewCriteriaByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/UpdateInterviewCriteria/:id",
		Handler: controller.UpdateInterviewCriteria,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteInterviewCriteria/:id",
		Handler: controller.DeleteInterviewCriteria,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateRawSQL",
		Handler: controller.CreateRawSQL,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/RenderInterviewCriteriaForm",
		Handler: controller.RenderInterviewCriteriaForm,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/RenderCreateInterviewCriteriaForm",
		Handler: controller.RenderCreateInterviewCriteriaForm,
		Method:  core.GET,
	})

	return routeList
}

func (controller *InterviewCriteriaController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
