package dto

type AddUserRole struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
}

type DelUserRole struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
}
