package models

type ArchiveMessage struct {
	ID                 string        `json:"id"`           // unique id of the message in the messages.json file
	Name               string        `json:"name"`         // nickname of the poster at the time of the message
	MessageText        string        `json:"text"`         // the text content of the message
	MessageAttachments []interface{} `json:"attachments"`  // a list of attachments (each should be a URL)
	UserId             string        `json:"user_id"`      // the user who posted this message
	AvatarUrl          string        `json:"avatar_url"`   // URL of the poster's avatar
	LikedBy            []string      `json:"favorited_by"` // list of user IDs who liked this message
	Date               int64         `json:"created_at"`   // when this message was posted
	System             bool          `json:"system"`       // was this message posted by the GroupMe system user (for name changes, kicks, events, etc.)
}
