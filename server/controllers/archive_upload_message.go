package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

const messagesJson = "message.json"

func getMessagesJson(raw []byte) ([]models.ArchiveMessage, error) {
	x := make([]models.ArchiveMessage, 0)

	err := json.Unmarshal(raw, &x)
	if err != nil {
		return nil, err
	}
	return x, nil
}

func messageAlreadyExists(allMessages map[string]models.Message, newMessage models.ArchiveMessage) bool {
	_, ok := allMessages[newMessage.ID]
	if ok {
		return true
	}
	return false
}

func getAllMessagesFromDataStore(channelId primitive.ObjectID) (map[string]models.Message, error) {
	messages := make([]models.Message, 0)
	messageMap := make(map[string]models.Message)

	err := common.GetAllWhere(models.MessagesCollection(), bson.M{"channel_id": channelId}, &messages)
	if err != nil {
		return nil, err
	}

	for _, message := range messages {
		messageMap[message.ArchiveMessageId] = message
	}

	return messageMap, nil
}

func getMessagesWithLimit(channelId primitive.ObjectID, limit int64, reverse bool) ([]models.Message, error) {
	messages := make([]models.Message, 0)

	x := 1
	if reverse {
		x = -1
	}

	err := common.GetAllWhereLimitSort(models.MessagesCollection(), bson.M{"channel_id": channelId}, &messages, limit, bson.M{"date": x})
	return messages, err
}

func countMessagesForMember(member models.Member) (int64, error) {
	filter := bson.M{"user_id": member.ArchiveMemberId}
	return common.Count(models.MessagesCollection(), filter)
}

func getMessagesWithWhereAndLimit(channelId primitive.ObjectID, where bson.M, limit int64, reverse bool) ([]models.Message, error) {
	messages := make([]models.Message, 0)
	where["channel_id"] = channelId

	order := 1
	if reverse {
		order = -1
	}

	err := common.GetAllWhereLimitSort(models.MessagesCollection(), where, &messages, limit, bson.M{"date": order})
	return messages, err
}

func handleMessagesJson(rawBytes []byte, item UploadResponse) (UploadResponse, error) {
	fmt.Println(" Data: ")
	data, err := getMessagesJson(rawBytes)
	if err != nil {
		return UploadResponse{}, err
	}

	if len(data) > 0 {
		fmt.Printf("%+v\n", data[0])
		fmt.Printf("Got %d messages in this channel.\n", len(data))
	} else {
		return UploadResponse{}, common.ApiErrorf400("Messages JSON was empty")
	}

	channel, err := getChannelFromDataStore(item.ChannelId)

	existingMessages, err := getAllMessagesFromDataStore(channel.ChannelId)
	if err != nil {
		return UploadResponse{}, err
	}

	//fmt.Printf("existing messages for channel: %+v\n", existingMessages)

	item.MessageCount = len(data)

	members, err := getMembersMapFromDatastore()
	if err != nil {
		return item, err
	}

	addedMessagesCount := 0
	for _, message := range data {
		if !messageAlreadyExists(existingMessages, message) {
			_, err := addMessageToDataStore(message, channel)
			if err != nil {
				return item, err
			}
			addedMessagesCount++
		}

		if message.UserId != "calendar" && message.UserId != "system" {
			hasAlias, err := memberHasAlias(members, message.UserId, message.Name, channel.ChannelId)
			if err != nil {
				//I believe this happens when a member that's no longer in any groups sent a message in a channel
				fmt.Println(err)
				continue
			}
			if !hasAlias {
				member := members[message.UserId]
				alias := models.Alias{
					ChannelId: channel.ChannelId,
					Name:      message.Name,
					CreatedAt: time.Unix(message.Date, 0),
					AvatarUrl: message.AvatarUrl,
				}
				fmt.Printf("Add alias %+v to user %s\n", alias, message.UserId)
				err := addAliasToMemberInDataStore(member, alias)
				if err != nil {
					return item, err
				}
				member.Aliases = append(member.Aliases, alias)
				members[message.UserId] = member
			}
		}
	}

	item.AddedMessageCount = addedMessagesCount
	return item, nil
}

func addMessageToDataStore(message models.ArchiveMessage, channel models.Channel) (models.Message, error) {
	newMessage := models.Message{
		ChannelId:          channel.ChannelId,
		ArchiveMessageId:   message.ID,
		MessageText:        message.MessageText,
		MessageAttachments: message.MessageAttachments,
		UserId:             message.UserId,
		LikedBy:            message.LikedBy,
		Date:               time.Unix(message.Date, 0),
		PosterName:         message.Name,
		AvatarUrl:          message.AvatarUrl,
	}

	created, err := common.CreateOne(models.MessagesCollection(), &newMessage)
	if err != nil {
		return models.Message{}, err
	}

	return *created.(*models.Message), nil
}
