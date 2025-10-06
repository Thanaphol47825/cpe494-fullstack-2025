package meta

import (
	"strings"
)

// parseFormTag parses form tag string into key-value map
// Example: "label:Product Name;placeholder:Enter name;type:text;format:text"
func parseFormTag(tag string) map[string]string {
	config := make(map[string]string)
	if tag == "" {
		return config
	}

	pairs := strings.Split(tag, ";")
	for _, pair := range pairs {
		if strings.Contains(pair, ":") {
			parts := strings.SplitN(pair, ":", 2)
			if len(parts) == 2 {
				config[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
			}
		}
	}
	return config
}

// getFormValue gets a value from form config with fallback
func getFormValue(config map[string]string, key, fallback string) string {
	if val, exists := config[key]; exists {
		return val
	}
	return fallback
}

// defaultInputType determines the default input type based on Go type
func defaultInputType(goType string) string {
	switch goType {
	case "int", "int8", "int16", "int32", "int64",
		"uint", "uint8", "uint16", "uint32", "uint64",
		"float32", "float64":
		return "number"
	case "bool":
		return "checkbox"
	case "Time":
		return "date"
	}
	return "text"
}

// cleanJSONName removes omitempty and other modifiers from JSON tag
func cleanJSONName(jsonTag string) string {
	if jsonTag == "" || jsonTag == "-" {
		return ""
	}
	// Remove omitempty if present
	if strings.Contains(jsonTag, ",") {
		return strings.Split(jsonTag, ",")[0]
	}
	return jsonTag
}
