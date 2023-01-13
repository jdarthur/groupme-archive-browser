package models

import (
	"context"
	"fmt"
	"github.com/jdarthur/groupme-archive-browser/v2/server/common"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

type Message struct {
	ChannelId          primitive.ObjectID `json:"channel_id" bson:"channel_id"`                   // unique ID for the channel that this message was posted in
	MessageId          primitive.ObjectID `json:"message_id" bson:"_id"`                          // unique ID for this message in our DB
	PosterName         string             `json:"poster_name" bson:"poster_name"`                 // nickname in the chat at the time of who posted the message
	ArchiveMessageId   string             `json:"-" bson:"archive_message_id"`                    // message ID as stored in conversation.json
	MessageText        string             `json:"message_text" bson:"message_text"`               // the text content of the message
	MessageAttachments []interface{}      `json:"message_attachments" bson:"message_attachments"` // a list of attachments (each should be a URL)
	UserId             string             `json:"user_id" bson:"user_id"`                         // the user who posted this message
	LikedBy            []string           `json:"liked_by" bson:"liked_by"`                       // list of user IDs who liked this message
	Date               time.Time          `json:"date" bson:"date"`                               // when this message was posted
	AvatarUrl          string             `json:"avatar_url" bson:"avatar_url"`                   // URL of poster's avi at the time of the post
	EndOfTheLine       bool               `json:"end_of_the_line" bson:"-"`                       // Is this message the first or last message for a channel
}

func (m *Message) ID() primitive.ObjectID {
	return m.MessageId
}

func (m *Message) SetID(id primitive.ObjectID) {
	m.MessageId = id
}

func MessagesCollection() common.Collection {
	return common.Collection{
		CollectionId: "message",
		PrettyName:   "Message",
	}
}

func AddDateIndex() error {
	collection := common.Database.Collection(MessagesCollection().CollectionId)
	mod := mongo.IndexModel{
		Keys:    bson.M{"date": 1},
		Options: nil,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	ind, err := collection.Indexes().CreateOne(ctx, mod)
	if err != nil {
		return err
	}

	fmt.Printf("created index %s\n", ind)
	return nil
}

func DateIndexExists() (bool, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := common.Database.Collection(MessagesCollection().CollectionId)
	cursor, err := collection.Indexes().List(ctx)
	if err != nil {
		return false, err
	}

	var result []bson.M
	if err = cursor.All(context.TODO(), &result); err != nil {
		return false, err
	}

	for _, value := range result {
		indexKey := value["key"].(bson.M)
		if len(indexKey) == 1 {
			val, ok := indexKey["date"]
			if ok {
				valAsInt, ok := val.(int32)
				if !ok {
					msg := fmt.Sprintf("Order value from index was not an int32? got a %T\n", val)
					panic(msg)
				}
				if valAsInt == 1 {
					return true, nil
				}
			}
		}
	}

	return false, nil
}
