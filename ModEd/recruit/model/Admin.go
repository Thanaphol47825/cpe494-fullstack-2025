// MEP-1003 Student Recruitment
package model

import "ModEd/core"

type Admin struct {
	core.BaseModel
	Username string `csv:"username"`
	Password string `csv:"password"`
}
