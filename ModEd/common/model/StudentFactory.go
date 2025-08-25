package model

// Wrote by MEP-0001

type StudentInterface interface {
	Validate() error
}

func NewStudentByProgram(st ProgramType) StudentInterface {
	switch st {
	case REGULAR:
		student := RegularStudent{}
		student.Program = REGULAR
		return &student
	case INTERNATIONAL:
		student := InternationalStudent{}
		student.Program = INTERNATIONAL
		return &student
	default:
		student := Student{}
		student.Program = st
		return &student
	}
}
