package models

import (
	"github.com/jdarthur/groupme-archive-browser/v2/server/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

// Channel this is a respresentation of a channel in the MongoDB data store
type Channel struct {
	ChannelId        primitive.ObjectID `json:"channel_id" bson:"_id"`
	ArchiveChannelId string             `json:"archive_channel_id" bson:"archive_channel_id"`
	Name             string             `json:"name" bson:"name"`
	CreatedAt        time.Time          `json:"created_at" bson:"created_at"`
	CreatedBy        string             `json:"created_by" bson:"created_by"`
	ImageUrl         string             `json:"image_url" bson:"image_url"`
	Members          []Member           `json:"members" bson:"-"`
	MessageCount     int64              `json:"message_count" bson:"-"`
	Description      string             `json:"description" bson:"description"`
}

func (c *Channel) ID() primitive.ObjectID {
	return c.ChannelId
}

func (c *Channel) SetID(id primitive.ObjectID) {
	c.ChannelId = id
}

func ChannelsCollection() common.Collection {
	return common.Collection{
		CollectionId: "channel",
		PrettyName:   "Channel",
	}
}
