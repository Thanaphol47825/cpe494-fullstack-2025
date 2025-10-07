// MEP-1003 Student Recruitment
package model

import "ModEd/core"

type Admin struct {
	core.BaseModel
	Username string `csv:"username" json:"username" form:"text" label:"username"`
	Password string `csv:"password" json:"password" form:"password" label:"password"`
}
