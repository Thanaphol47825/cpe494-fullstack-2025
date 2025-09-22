package demo

type Field struct {
	Name    string `gorm:"type:varchar(255)" json:"Name" csv:"Name"`
	Surname string `gorm:"type:varchar(255)" json:"Surname" csv:"Surname"`
	Age     int    `gorm:"type:int" json:"Age" csv:"Age"`
}

type Admin struct {
	Username string `csv:"username"`
	Password string `csv:"password"`
}
