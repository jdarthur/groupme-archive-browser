package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"go.mongodb.org/mongo-driver/bson"
	"time"
)

const conversationJson = "conversation.json"

func getAllChannelsFromDataStore() ([]models.Channel, error) {
	messages := make([]models.Channel, 0)

	err := common.GetAllWhere(models.ChannelsCollection(), bson.M{}, &messages)
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func channelInDataStore(channels []models.Channel, newChannel models.ArchiveChannel) bool {
	for _, channel := range channels {
		if channel.ArchiveChannelId == newChannel.ChannelId {
			return true
		}
	}
	return false
}

func getConversationJson(raw []byte) (models.ArchiveChannel, error) {
	x := models.ArchiveChannel{}

	err := json.Unmarshal(raw, &x)
	if err != nil {
		return models.ArchiveChannel{}, err
	}
	return x, nil
}

func handleConversationJson(rawBytes []byte, item UploadResponse, allChannels []models.Channel) (UploadResponse, error) {
	//fmt.Println(" Data: ")
	data, err := getConversationJson(rawBytes)
	if err != nil {
		return UploadResponse{}, err
	}
	//fmt.Printf("%+v\n", data)

	item.ChannelId = data.ChannelId
	item.ChannelName = data.Name
	item.Members = data.Members

	if !channelInDataStore(allChannels, data) {
		fmt.Printf("\nNeed to add channel %s to data store.\n", data.ChannelId)
		channel, err := addChannelToDataStore(data)
		if err != nil {
			return UploadResponse{}, err
		}
		fmt.Printf("\nCreated channel %+v in data store.\n", channel)
	} else {
		fmt.Printf("\nWe already have channel %s in data store.\n", data.ChannelId)
	}

	members, err := getAllMembersFromDataStore()
	if err != nil {
		return item, err
	}

	err = handleChannelMembers(data, members)
	return item, err
}

func addChannelToDataStore(channel models.ArchiveChannel) (models.Channel, error) {

	collection := models.ChannelsCollection()
	newChannel := models.Channel{
		ArchiveChannelId: channel.ChannelId,
		Name:             channel.Name,
		CreatedAt:        time.Unix(int64(channel.CreatedAt), 0),
		CreatedBy:        channel.CreatedBy,
		ImageUrl:         channel.ImageUrl,
		Description:      channel.Description,
	}

	created, err := common.CreateOne(collection, &newChannel)
	return *created.(*models.Channel), err
}

func getChannelFromDataStore(archiveChannelId string) (models.Channel, error) {
	channel := models.Channel{}
	err := common.GetOneByFilter(models.ChannelsCollection(), bson.M{"archive_channel_id": archiveChannelId}, &channel)
	return channel, err
}
