package models

// ArchiveMember this maps to a member in the `members` list in `conversation.json
type ArchiveMember struct {
	MemberId string `json:"user_id"`
	ImageUrl string `json:"image_url"`
	Name     string `json:"name"`
	Nickname string `json:"nickname"`
}
