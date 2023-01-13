package models

import (
	"github.com/jdarthur/groupme-archive-browser/v2/server/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

// Member this is a channel member as stored in MongoDB
type Member struct {
	MemberId        primitive.ObjectID `json:"user_id" bson:"_id"`
	ArchiveMemberId string             `json:"archive_member_id" bson:"archive_member_id"`
	ImageUrl        string             `json:"image_url" bson:"image_url"`
	Name            string             `json:"name" bson:"name"`
	Aliases         []Alias            `json:"aliases" bson:"aliases"`
	Channels        []string           `json:"channels" bson:"channels"`
	MessageCount    int64              `json:"message_count" bson:"-"`
}

type Alias struct {
	ChannelId primitive.ObjectID `json:"channel_id" bson:"channel_id"`
	Name      string             `json:"name" bson:"name"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	AvatarUrl string             `json:"avatar_url" bson:"avatar_url"`
}

func MembersCollection() common.Collection {
	return common.Collection{
		CollectionId: "member",
		PrettyName:   "Member",
	}
}

func (m *Member) ID() primitive.ObjectID {
	return m.MemberId
}

func (m *Member) SetID(id primitive.ObjectID) {
	m.MemberId = id
}
