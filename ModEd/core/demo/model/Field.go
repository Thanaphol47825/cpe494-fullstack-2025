package demo

type Field struct {
	Name    string `gorm:"type:varchar(255)" json:"Name" csv:"Name" form:"text" label:"Name"`
	Surname string `gorm:"type:varchar(255)" json:"Surname" csv:"Surname" form:"text" label:"Surname"`
	Age     int    `gorm:"type:int" json:"Age" csv:"Age" form:"number" label:"Age"`
}

type Admin struct {
	Username string `csv:"username"`
	Password string `csv:"password"`
}
