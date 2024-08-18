package dtos

type PageDto struct {
	Body struct {
		Name        string `json:"name" docs:"page name"`
		Route       string `json:"route"`
		CustomTheme bool   `json:"custom_theme"`
	}
}
