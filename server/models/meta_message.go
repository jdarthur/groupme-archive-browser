package models

import "time"

type MetaMessage struct {
	MessageId     string    // the message or meta-message this meta-message refers to
	MetaMessageId string    // unique ID for this meta-message in our DB
	MessageText   string    // the text content of the meta-message
	UserId        string    // the user who posted this meta-message
	Date          time.Time // when this message was posted
}
