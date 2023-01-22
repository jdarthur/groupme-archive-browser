package models

import (
	"github.com/jdarthur/groupme-archive-browser/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

// Highlight is a collection of one or more HighlightComponent's
// These can be for example
//   - a collection of funny messages on a certain topic
//   - used as a sort-of "quote tweet"-like functionality
//   - used to "save" a particularly good thread
//   - etc.
//
// They are a user-curated way to produce and display meta-content
// in a different way than just randomly clicking around in channels.
type Highlight struct {
	Components  []HighlightComponent `json:"components" bson:"components"`
	HighlightId primitive.ObjectID   `json:"highlight_id" bson:"_id"`
	CreatedAt   time.Time            `json:"created_at" bson:"created_at"`
	MemberId    string               `json:"member_id" bson:"member_id"`
	Title       string               `json:"title" bson:"title"`
}

func (h *Highlight) ID() primitive.ObjectID {
	return h.HighlightId
}

func (h *Highlight) SetID(id primitive.ObjectID) {
	h.HighlightId = id
}

var OneMessage = "one_message"
var ThreadStartingEnding = "thread_starting_and_ending_with"
var componentTypes = []string{OneMessage, ThreadStartingEnding}

// HighlightComponent is made up of one or more messages, as well as
// an optional comment. It is the building block of a Highlight
type HighlightComponent struct {
	Type           string `json:"type" bson:"type"`
	FirstMessageId string `json:"first_message_id" bson:"first_message_id"`
	LastMessageId  string `json:"last_message_id" bson:"last_message_id"`
	Comment        string `json:"comment" bson:"comment"`
}

// Valid determines where a HighlightComponent is valid.
//
//	- It validates that the message ID(s) are proper, non-empty ObjectID(s)
//  - It does not validate that they are real message IDs in the database.
//  - It also validates that the type is a valid type, and
//  - that the first and last message IDs are not the same value.
func (hc HighlightComponent) Valid() (bool, common.ApiError) {
	found := false
	for _, t := range componentTypes {
		if t == hc.Type {
			found = true
			break
		}
	}

	if !found {
		return false, common.ApiErrorf400("Invalid component type: %s", hc.Type)
	}

	if hc.FirstMessageId == "" {
		return false, common.ApiErrorf400("First message ID is empty")
	}

	_, err := primitive.ObjectIDFromHex(hc.FirstMessageId)
	if err != nil {
		return false, common.ApiErrorf400("First message ID %s is not a valid ObjectID", hc.FirstMessageId)
	}

	if hc.Type == ThreadStartingEnding {
		if hc.LastMessageId == "" {
			return false, common.ApiErrorf400("Last message ID is empty")
		}

		if hc.LastMessageId == hc.FirstMessageId {
			return false, common.ApiErrorf400("First and last message IDs are the same")
		}

		_, err := primitive.ObjectIDFromHex(hc.LastMessageId)
		if err != nil {
			return false, common.ApiErrorf400("Last message ID %s is not a valid ObjectID", hc.LastMessageId)
		}
	}
	return true, nil
}

func HighlightsCollection() common.Collection {
	return common.Collection{
		CollectionId: "highlight",
		PrettyName:   "Highlight",
	}
}
