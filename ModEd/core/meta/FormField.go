package meta

type FormField struct {
	Label        string                   `json:"label"`
	Placeholder  string                   `json:"placeholder,omitempty"`
	Name         string                   `json:"name"`
	Type         string                   `json:"type"`
	Format       string                   `json:"format,omitempty"`
	Data         []map[string]interface{} `json:"data,omitempty"`
	Required     bool                     `json:"required,omitempty"`
	TableDisplay bool                     `json:"display,omitempty"`
	APIUrl       string                   `json:"apiurl,omitempty"`
}
