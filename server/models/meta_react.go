package models

import "time"

type MetaReact struct {
	MessageId string    // the message or meta-message this react refers to
	ReactId   string    // unique ID for this meta-react in our DB
	Content   string    // the individual react present
	UserId    string    // the user who reacted
	Date      time.Time // when this react was hit
}
