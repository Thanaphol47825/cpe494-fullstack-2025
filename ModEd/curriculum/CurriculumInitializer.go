package curriculum

import (
	"ModEd/core"
	"ModEd/curriculum/controller"
)

func InitialCurriculum() {
	application := core.GetApplication()

	// Basic Curriculum
	application.AddController(controller.NewClassController())
	application.AddController(controller.NewClassMaterialController())
	application.AddController(controller.NewCoursePlanController())
	application.AddController(controller.NewCurriculumController())
	application.AddController(controller.NewCourseController())
	application.AddController(controller.NewSkillController())
	application.AddController(controller.NewCourseSkillController())

	// Student Internship
	application.AddController(controller.NewInternshipCriteriaController())
	application.AddController(controller.NewInternshipRegistrationController(application))
	application.AddController(controller.NewInternshipAttendanceController())
	application.AddController(controller.NewInternshipMentorController(application))
	application.AddController(controller.NewInternshipEvaluationController())
	application.AddController(controller.NewInternshipResultEvaluationController())
	application.AddController(controller.NewInternshipReportController())
	application.AddController(controller.NewInternStudentController(application))
	application.AddController(controller.NewCompanyController(application))
	application.AddController(controller.NewInternshipInformationController(application))
	application.AddController(controller.NewSupervisorReviewController())
	application.AddController(controller.NewCertificateController(application))
	application.AddController(controller.NewInternCertificateController(application))
	application.AddController(controller.NewInternSkillController(application))
	application.AddController(controller.NewInternStudentSkillController(application))
	application.AddController(controller.NewInternshipAnnouncementController(application))

	application.AddController(controller.NewAdvisorController())
	application.AddController(controller.NewInternWorkExperienceController(application))
	application.AddController(controller.NewInternProjectController(application))

}
