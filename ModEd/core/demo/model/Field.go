package demo

type Field struct {
	Name    string `gorm:"type:varchar(255)" json:"name" csv:"Name" form:"text" label:"name"`
	Surname string `gorm:"type:varchar(255)" json:"surname" csv:"Surname" form:"text" label:"surname"`
	Age     int    `gorm:"type:int" json:"age" csv:"Age" form:"number" label:"age"`
}

type Admin struct {
	Username string `csv:"username"`
	Password string `csv:"password"`
}
