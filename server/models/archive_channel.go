package models

// Channel this maps to a group in the archive conversation.json file
type ArchiveChannel struct {
	ChannelId   string          `json:"group_id"`
	Name        string          `json:"name"`
	CreatedAt   float64         `json:"created_at"`
	CreatedBy   string          `json:"creator_user_id"`
	ImageUrl    string          `json:"image_url"`
	Members     []ArchiveMember `json:"members"`
	Description string          `json:"description"`
}
