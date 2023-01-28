package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"strings"
)

// Search for messages by keyword

// Search for messages by user

// Get top messages by like count
// - Take optional minimum like count
// - Take optional date period

type SearchController struct{}

type SearchBody struct {
	SearchText    string `json:"search_text"`
	LikeThreshold int    `json:"like_threshold"`
}

func (sc SearchController) SearchForText(c *gin.Context) {
	body := SearchBody{}
	err := c.Bind(&body)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	channelIdFromPath := c.Param("channelId")
	channelId, err := primitive.ObjectIDFromHex(channelIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid channel ID from path: %s", channelIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	if body.SearchText == "" {
		e := common.ApiErrorf400("Invalid empty search text in body.")
		common.RespondWithError(c, e)
		return
	}

	messages, err := getMessagesWithLimit(channelId, -1, false)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	output := make([]models.Message, 0)
	for _, message := range messages {
		if message.Disavowal != nil && message.Disavowal.Disavow == true {
			continue // disavowed messages will not show up in search
		}

		lowerText := strings.ToLower(message.MessageText)
		lowerSearch := strings.ToLower(body.SearchText)
		if strings.Contains(lowerText, lowerSearch) {
			output = append(output, message)
		}
	}

	common.RespondSuccess(c, output, len(output), false)
}

func (sc SearchController) SearchByLikeThreshold(c *gin.Context) {
	body := SearchBody{}
	err := c.Bind(&body)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	channelIdFromPath := c.Param("channelId")
	channelId, err := primitive.ObjectIDFromHex(channelIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid channel ID from path: %s", channelIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	if body.LikeThreshold <= 0 {
		e := common.ApiErrorf400("Like threshold must be greater than 0.")
		common.RespondWithError(c, e)
		return
	}

	messages, err := getMessagesWithLimit(channelId, -1, false)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	output := make([]models.Message, 0)
	for _, message := range messages {
		if message.Disavowal != nil && message.Disavowal.Disavow == true {
			continue // disavowed messages will not show up in search
		}

		if len(message.LikedBy) >= body.LikeThreshold {
			output = append(output, message)
		}
	}

	common.RespondSuccess(c, output, len(output), false)
}
