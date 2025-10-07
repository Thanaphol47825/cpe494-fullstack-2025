package controller

import (
	"ModEd/core"
	"ModEd/recruit/model"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

const (
	ErrCannotParseJSON      = "Cannot parse JSON"
	ErrInterviewNotFound    = "Interview not found"
	ErrWhereIDAndInstructor = "id = ? AND instructor_id = ?"
)

type InterviewController struct {
	application *core.ModEdApplication
}

func NewInterviewController() *InterviewController {
	controller := &InterviewController{}
	return controller
}

func (controller *InterviewController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *InterviewController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *InterviewController) RenderInterviewCreate(context *fiber.Ctx) error {
	path := filepath.Join(controller.application.RootPath, "recruit", "view", "InterviewCreate.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
		return context.Status(500).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Template not found",
		})
	}

	rendered := template.Render(map[string]string{
		"title":   "Create Interview",
		"RootURL": controller.application.RootURL,
	})

	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *InterviewController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/interview/create",
		Handler: controller.RenderInterviewCreate,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/CreateInterview",
		Handler: controller.CreateInterview,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetInterviews",
		Handler: controller.GetAllInterviews,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/GetInterview/:id",
		Handler: controller.GetInterviewByID,
		Method:  core.GET,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/UpdateInterview",
		Handler: controller.UpdateInterview,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/DeleteInterview",
		Handler: controller.DeleteInterview,
		Method:  core.POST,
	})

	// My Interview (authenticated) CRUD
	routeList = append(routeList, &core.RouteItem{
		Route:      "/recruit/my/interviews",
		Handler:    controller.GetMyInterviews,
		Method:     core.GET,
		Middleware: core.Middleware{AuthType: core.AuthAny},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:      "/recruit/my/interview",
		Handler:    controller.CreateMyInterview,
		Method:     core.POST,
		Middleware: core.Middleware{AuthType: core.AuthAny},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:      "/recruit/my/interview/:id",
		Handler:    controller.GetMyInterviewByID,
		Method:     core.GET,
		Middleware: core.Middleware{AuthType: core.AuthAny},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:      "/recruit/my/interview/:id",
		Handler:    controller.UpdateMyInterview,
		Method:     core.POST,
		Middleware: core.Middleware{AuthType: core.AuthAny},
	})
	routeList = append(routeList, &core.RouteItem{
		Route:      "/recruit/my/interview/delete/:id",
		Handler:    controller.DeleteMyInterview,
		Method:     core.POST,
		Middleware: core.Middleware{AuthType: core.AuthAny},
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/SetupTestData",
		Handler: controller.SetupTestData,
		Method:  core.POST,
	})
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/SetupMockData",
		Handler: controller.SetupMockData,
		Method:  core.POST,
	})

	return routeList
}

func (controller *InterviewController) CreateInterview(context *fiber.Ctx) error {
	interview := new(model.Interview)

	if err := context.BodyParser(interview); err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: ErrCannotParseJSON,
		})
	}

	if err := controller.application.DB.Create(interview).Error; err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(context, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: interview,
	})
}

func (controller *InterviewController) GetAllInterviews(context *fiber.Ctx) error {
	var interviews []*model.Interview

	if err := controller.application.DB.
		Preload("Instructor").
		Preload("ApplicationReport").
		Find(&interviews).Error; err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(context, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: interviews,
	})
}

func (controller *InterviewController) GetInterviewByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var interview model.Interview

	if err := controller.application.DB.
		Preload("Instructor").
		Preload("ApplicationReport").
		First(&interview, id).Error; err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusNotFound, Message: ErrInterviewNotFound,
		})
	}

	return core.SendResponse(context, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: interview,
	})
}

func (controller *InterviewController) UpdateInterview(context *fiber.Ctx) error {
	interview := new(model.Interview)
	if err := context.BodyParser(interview); err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: ErrCannotParseJSON,
		})
	}

	if interview.ID == 0 {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Missing ID",
		})
	}

	var existing model.Interview
	if err := controller.application.DB.First(&existing, interview.ID).Error; err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusNotFound, Message: ErrInterviewNotFound,
		})
	}

	updateData := map[string]interface{}{
		"instructor_id":         interview.InstructorID,
		"application_report_id": interview.ApplicationReportID,
		"scheduled_appointment": interview.ScheduledAppointment,
		"criteria_scores":       interview.CriteriaScores,
		"total_score":           interview.TotalScore,
		"evaluated_at":          interview.EvaluatedAt,
		"interview_status":      interview.InterviewStatus,
	}

	if err := controller.application.DB.Model(&existing).Updates(updateData).Error; err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(context, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: existing,
	})
}

func (controller *InterviewController) DeleteInterview(context *fiber.Ctx) error {
	interview := new(model.Interview)
	if err := context.BodyParser(interview); err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: ErrCannotParseJSON,
		})
	}

	if interview.ID == 0 {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusBadRequest, Message: "Missing ID",
		})
	}

	if err := controller.application.DB.Delete(&model.Interview{}, interview.ID).Error; err != nil {
		return core.SendResponse(context, core.BaseApiResponse{
			IsSuccess: false, Status: fiber.StatusInternalServerError, Message: err.Error(),
		})
	}

	return core.SendResponse(context, core.BaseApiResponse{
		IsSuccess: true, Status: fiber.StatusOK, Result: "Interview deleted successfully",
	})
}

// Helper: get current instructor ID from session token cookie
func (controller *InterviewController) getCurrentInstructorID(context *fiber.Ctx) (uint, bool) {
	token := context.Cookies("token", "")
	if token == "" || controller.application == nil || controller.application.SessionManager == nil {
		return 0, false
	}
	session, ok := controller.application.SessionManager.Get(token)
	if !ok || session.UserID == "" {
		return 0, false
	}
	// assume session.UserID is numeric and maps to InstructorID
	uid, err := strconv.ParseUint(session.UserID, 10, 64)
	if err != nil {
		return 0, false
	}
	return uint(uid), true
}

// GET /recruit/my/interviews
func (controller *InterviewController) GetMyInterviews(context *fiber.Ctx) error {
	instructorID, ok := controller.getCurrentInstructorID(context)
	if !ok {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "unauthorized",
		})
	}

	var interviews []*model.Interview
	if err := controller.application.DB.
		Where("instructor_id = ?", instructorID).
		Preload("Instructor").
		Preload("ApplicationReport").
		Find(&interviews).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    interviews,
	})
}

// POST /recruit/my/interview
func (controller *InterviewController) CreateMyInterview(context *fiber.Ctx) error {
	instructorID, ok := controller.getCurrentInstructorID(context)
	if !ok {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "unauthorized",
		})
	}

	interview := new(model.Interview)
	if err := context.BodyParser(interview); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}
	// enforce ownership
	interview.InstructorID = instructorID

	if err := controller.application.DB.Create(interview).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    interview,
	})
}

// GET /recruit/my/interview/:id
func (controller *InterviewController) GetMyInterviewByID(context *fiber.Ctx) error {
	instructorID, ok := controller.getCurrentInstructorID(context)
	if !ok {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "unauthorized",
		})
	}
	id := context.Params("id")
	var interview model.Interview
	if err := controller.application.DB.
		Where(ErrWhereIDAndInstructor, id, instructorID).
		Preload("Instructor").
		Preload("ApplicationReport").
		First(&interview).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    ErrInterviewNotFound,
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    interview,
	})
}

// POST /recruit/my/interview/:id
func (controller *InterviewController) UpdateMyInterview(context *fiber.Ctx) error {
	instructorID, ok := controller.getCurrentInstructorID(context)
	if !ok {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "unauthorized",
		})
	}
	id := context.Params("id")

	var existing model.Interview
	if err := controller.application.DB.Where(ErrWhereIDAndInstructor, id, instructorID).First(&existing).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    ErrInterviewNotFound,
		})
	}

	var updateData model.Interview
	if err := context.BodyParser(&updateData); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if updateData.ApplicationReportID != 0 {
		existing.ApplicationReportID = updateData.ApplicationReportID
	}
	if !updateData.ScheduledAppointment.IsZero() {
		existing.ScheduledAppointment = updateData.ScheduledAppointment
	}
	if updateData.CriteriaScores != "" {
		existing.CriteriaScores = updateData.CriteriaScores
	}
	if updateData.TotalScore != 0 {
		existing.TotalScore = updateData.TotalScore
	}
	if !updateData.EvaluatedAt.IsZero() {
		existing.EvaluatedAt = updateData.EvaluatedAt
	}
	if updateData.InterviewStatus != "" {
		existing.InterviewStatus = updateData.InterviewStatus
	}

	if err := controller.application.DB.Save(&existing).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existing,
	})
}

// POST /recruit/my/interview/delete/:id
func (controller *InterviewController) DeleteMyInterview(context *fiber.Ctx) error {
	instructorID, ok := controller.getCurrentInstructorID(context)
	if !ok {
		return context.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"isSuccess": false,
			"result":    "unauthorized",
		})
	}
	id := context.Params("id")

	// ensure ownership
	var interview model.Interview
	if err := controller.application.DB.Where(ErrWhereIDAndInstructor, id, instructorID).First(&interview).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    ErrInterviewNotFound,
		})
	}

	if err := controller.application.DB.Delete(&model.Interview{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Interview deleted successfully",
	})
}

// POST /recruit/SetupTestData - Create required test data for interviews
func (controller *InterviewController) SetupTestData(context *fiber.Ctx) error {
	rawSQL := `
		-- Create faculties
		INSERT INTO faculties (id, name, budget) VALUES 
		(1, 'Faculty of Science', 100000),
		(2, 'Faculty of Engineering', 150000)
		ON CONFLICT (id) DO NOTHING;
		
		-- Create departments
		INSERT INTO departments (id, name, faculty, budget) VALUES 
		(1, 'Computer Science Department', 'Faculty of Science', 50000),
		(2, 'Physics Department', 'Faculty of Science', 30000),
		(3, 'Computer Engineering Department', 'Faculty of Engineering', 80000)
		ON CONFLICT (id) DO NOTHING;
		
		-- Create application rounds
		INSERT INTO application_rounds (id, round_name) VALUES 
		(1, 'Round 1'),
		(2, 'Round 2')
		ON CONFLICT (id) DO NOTHING;
		
		-- Create applicants
		INSERT INTO applicants (id, first_name, last_name, email, birth_date, address, phonenumber, gpax, high_school_program, tgat1, tgat2, tgat3, tpat1, tpat2, tpat3, tpat4, tpat5, portfolio_url, family_income, math_grade, science_grade, english_grade) VALUES 
		(1, 'John', 'Smith', 'john.smith@email.com', '2000-01-01', '123 Main Street', '0812345678', 3.5, 'Science-Math', 80.0, 75.0, 85.0, 70.0, 75.0, 80.0, 85.0, 90.0, 'https://portfolio1.com', 50000.0, 85.0, 80.0, 75.0),
		(2, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '2000-02-01', '456 Oak Avenue', '0823456789', 3.8, 'Science-Math', 85.0, 80.0, 90.0, 75.0, 80.0, 85.0, 90.0, 95.0, 'https://portfolio2.com', 60000.0, 90.0, 85.0, 80.0),
		(3, 'Michael', 'Davis', 'michael.davis@email.com', '2000-03-01', '789 International St', '0834567890', 3.2, 'Science-Math', 75.0, 70.0, 80.0, 65.0, 70.0, 75.0, 80.0, 85.0, 'https://portfolio3.com', 40000.0, 80.0, 75.0, 70.0),
		(4, 'Emily', 'Brown', 'emily.brown@email.com', '2000-04-01', '321 Global Ave', '0845678901', 3.9, 'Science-Math', 90.0, 85.0, 95.0, 80.0, 85.0, 90.0, 95.0, 100.0, 'https://portfolio4.com', 70000.0, 95.0, 90.0, 85.0),
		(5, 'David', 'Wilson', 'david.wilson@email.com', '2000-05-01', '654 World Blvd', '0856789012', 3.0, 'Science-Math', 70.0, 65.0, 75.0, 60.0, 65.0, 70.0, 75.0, 80.0, 'https://portfolio5.com', 30000.0, 75.0, 70.0, 65.0)
		ON CONFLICT (id) DO NOTHING;
		
		-- Create instructors
		INSERT INTO instructors (id, instructor_code, first_name, last_name, email, department) VALUES 
		(1, 'INS001', 'Dr. James', 'Anderson', 'dr.james@university.edu', 'Computer Science Department'),
		(2, 'INS002', 'Dr. Lisa', 'Martinez', 'dr.lisa@university.edu', 'Computer Science Department'),
		(3, 'INS003', 'Dr. Robert', 'Wilson', 'dr.robert@university.edu', 'Physics Department')
		ON CONFLICT (id) DO NOTHING;
		
		-- Create application reports
		INSERT INTO application_reports (id, applicant_id, application_rounds_id, faculty_id, department_id, program, application_statuses) VALUES 
		(1, 1, 1, 1, 1, 'Regular', 'Pending'),
		(2, 2, 1, 1, 1, 'Regular', 'Interview'),
		(3, 3, 1, 1, 2, 'International', 'Evaluated'),
		(4, 4, 1, 2, 3, 'Regular', 'Accepted'),
		(5, 5, 1, 2, 3, 'International', 'Rejected')
		ON CONFLICT (id) DO NOTHING;
	`

	if err := controller.application.DB.Exec(rawSQL).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Test data created successfully",
	})
}

// SetupMockData - Create comprehensive mock data for interviews and related tables
func (controller *InterviewController) SetupMockData(context *fiber.Ctx) error {
	// Create mock data for all related tables
	rawSQL := `
		-- Create Faculties
		INSERT INTO faculties (id, name, code, created_at, updated_at) VALUES
		(1, 'Faculty of Engineering', 'ENG', NOW(), NOW()),
		(2, 'Faculty of Science', 'SCI', NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;

		-- Create Departments
		INSERT INTO departments (id, name, code, faculty_id, created_at, updated_at) VALUES
		(1, 'Computer Science', 'CS', 1, NOW(), NOW()),
		(2, 'Software Engineering', 'SE', 1, NOW(), NOW()),
		(3, 'Data Science', 'DS', 2, NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;

		-- Create Instructors
		INSERT INTO instructors (id, first_name, last_name, email, department_id, specialization, created_at, updated_at) VALUES
		(1, 'Dr. John', 'Smith', 'john.smith@university.edu', 1, 'Computer Science', NOW(), NOW()),
		(2, 'Prof. Sarah', 'Johnson', 'sarah.johnson@university.edu', 2, 'Software Engineering', NOW(), NOW()),
		(3, 'Dr. Michael', 'Brown', 'michael.brown@university.edu', 1, 'Data Science', NOW(), NOW()),
		(4, 'Dr. Emily', 'Davis', 'emily.davis@university.edu', 3, 'Machine Learning', NOW(), NOW()),
		(5, 'Prof. David', 'Wilson', 'david.wilson@university.edu', 2, 'Web Development', NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;

		-- Create Application Rounds
		INSERT INTO application_rounds (id, name, start_date, end_date, status, created_at, updated_at) VALUES
		(1, 'Spring 2025 Recruitment', '2025-01-01 00:00:00', '2025-03-31 23:59:59', 'Active', NOW(), NOW()),
		(2, 'Fall 2025 Recruitment', '2025-06-01 00:00:00', '2025-08-31 23:59:59', 'Upcoming', NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;

		-- Create Applicants
		INSERT INTO applicants (id, first_name, last_name, email, phone, program, gpa, experience_years, created_at, updated_at) VALUES
		(1, 'Alice', 'Wilson', 'alice.wilson@student.edu', '+1-555-0101', 'Computer Science', 3.8, 2, NOW(), NOW()),
		(2, 'Bob', 'Davis', 'bob.davis@student.edu', '+1-555-0102', 'Software Engineering', 3.9, 3, NOW(), NOW()),
		(3, 'Carol', 'Miller', 'carol.miller@student.edu', '+1-555-0103', 'Data Science', 3.7, 1, NOW(), NOW()),
		(4, 'David', 'Garcia', 'david.garcia@student.edu', '+1-555-0104', 'Computer Science', 3.6, 2, NOW(), NOW()),
		(5, 'Eva', 'Martinez', 'eva.martinez@student.edu', '+1-555-0105', 'Software Engineering', 3.9, 1, NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;

		-- Create Application Reports
		INSERT INTO application_reports (id, applicant_id, application_round_id, report_date, status, notes, created_at, updated_at) VALUES
		(1, 1, 1, '2025-01-15 10:00:00', 'Submitted', 'Strong technical background', NOW(), NOW()),
		(2, 2, 1, '2025-01-16 14:30:00', 'Under Review', 'Excellent academic record', NOW(), NOW()),
		(3, 3, 1, '2025-01-17 09:15:00', 'Approved', 'Outstanding research experience', NOW(), NOW()),
		(4, 4, 2, '2025-01-18 11:45:00', 'Submitted', 'Good programming skills', NOW(), NOW()),
		(5, 5, 2, '2025-01-19 16:20:00', 'Under Review', 'Strong portfolio', NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;

		-- Create Mock Interviews
		INSERT INTO interviews (id, instructor_id, application_report_id, scheduled_appointment, criteria_scores, total_score, evaluated_at, interview_status, created_at, updated_at) VALUES
		(1, 1, 1, '2025-01-20 14:00:00', '{"communication": 8.5, "technical": 9.0, "motivation": 8.0}', 8.5, '2025-01-20 15:30:00', 'Evaluated', NOW(), NOW()),
		(2, 2, 2, '2025-01-21 10:00:00', '{"communication": 7.5, "technical": 8.5, "motivation": 8.5}', 8.2, '2025-01-21 11:30:00', 'Accepted', NOW(), NOW()),
		(3, 3, 3, '2025-01-22 15:00:00', '{"communication": 9.0, "technical": 8.0, "motivation": 9.0}', 8.7, '2025-01-22 16:15:00', 'Evaluated', NOW(), NOW()),
		(4, 1, 4, '2025-01-23 09:00:00', '{"communication": 8.0, "technical": 7.5, "motivation": 8.0}', 7.8, NULL, 'Scheduled', NOW(), NOW()),
		(5, 2, 5, '2025-01-24 13:00:00', '{"communication": 6.5, "technical": 7.0, "motivation": 6.0}', 6.5, '2025-01-24 14:00:00', 'Rejected', NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;
	`

	if err := controller.application.DB.Exec(rawSQL).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Mock data created successfully! Created 5 interviews with related data.",
	})
}
