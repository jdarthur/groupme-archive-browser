package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"go.mongodb.org/mongo-driver/bson"
)

type ChannelController struct{}

func (cc ChannelController) GetChannels(c *gin.Context) {
	allChannels, err := getAllChannelsFromDataStore()

	if err != nil {
		common.Respond500(c, err)
		return
	}

	output := make([]models.Channel, 0)

	for _, channel := range allChannels {
		//get the number of messages in the channel
		messageCount, err := common.Count(models.MessagesCollection(), bson.M{"channel_id": channel.ChannelId})
		if err != nil {
			common.Respond500(c, err)
		}
		channel.MessageCount = messageCount

		//get all the members of this channel
		newMembers := make([]models.Member, 0)
		members, err := getMembersMapFromDatastore()
		for _, member := range members {
			for _, channelId := range member.Channels {
				if channelId == channel.ArchiveChannelId {
					newMembers = append(newMembers, member)
				}
			}
		}

		channel.Members = newMembers
		output = append(output, channel)
	}

	common.RespondSuccess(c, output, len(output), false)
}
