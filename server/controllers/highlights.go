package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type HighlightsController struct{}

func (hc HighlightsController) GetAllHighlights(c *gin.Context) {
	highlights := make([]models.Highlight, 0)
	err := common.GetAll(models.HighlightsCollection(), &highlights)
	if err != nil {
		common.Respond500(c, err)
	} else {
		common.RespondSuccess(c, highlights, len(highlights), false)
	}
}

func (hc HighlightsController) GetOneHighlight(c *gin.Context) {

	idFromPath := c.Param("highlightId")
	highlightId, err := primitive.ObjectIDFromHex(idFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid highlight ID from path: %s", idFromPath)
		common.RespondWithError(c, e)
		return
	}

	highlight := models.Highlight{}
	err = common.GetOneById(models.HighlightsCollection(), highlightId, &highlight)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	if highlight.HighlightId.IsZero() {
		apiErr := common.ApiError404{Message: fmt.Sprintf("Highlight with ID %s not found", highlightId.Hex())}
		common.RespondWithError(c, apiErr)
		return
	}

	common.RespondSuccess(c, highlight, 1, false)
}

func (hc HighlightsController) CreateHighlight(c *gin.Context) {
	highlight, err := hc.ValidateRequestBody(c)
	highlight.CreatedAt = time.Now()

	if err != nil {
		common.RespondWithError(c, err)
	} else {
		created, err := common.CreateOne(models.HighlightsCollection(), &highlight)
		if err != nil {
			common.Respond500(c, err)
		} else {
			common.RespondSuccess(c, created, 1, true)
		}
	}
}

func (hc HighlightsController) ValidateRequestBody(c *gin.Context) (models.Highlight, common.ApiError) {
	body := models.Highlight{}
	err := c.Bind(&body)
	if err != nil {
		x := make([]byte, 0)
		_, _ = c.Request.Body.Read(x)

		err := common.ApiErrorf400("Bad request body: %+v", string(x))
		return body, err
	}

	fmt.Printf("%+v\n", body)
	if !body.ID().IsZero() {
		err := common.ApiErrorf400("ID must not be specified in request body")
		return body, err
	}

	for _, component := range body.Components {
		valid, err := component.Valid()
		if !valid {
			return body, err
		}

		firstId, _ := primitive.ObjectIDFromHex(component.FirstMessageId) // this is validated in component.Valid()
		count, err1 := common.Count(models.MessagesCollection(), bson.M{"_id": firstId})
		if err != nil {
			return body, common.ApiErrorf500("Error counting in messages collection: %s", err1.Error())
		}
		if count == 0 {
			return body, common.ApiErrorf400("Nonexistent first message ID: %s", firstId.Hex())
		}

		if component.Type == models.ThreadStartingEnding {
			lastId, _ := primitive.ObjectIDFromHex(component.LastMessageId) // this is validated in component.Valid()
			count, err1 := common.Count(models.MessagesCollection(), bson.M{"_id": lastId})
			if err != nil {
				return body, common.ApiErrorf500("Error counting in messages collection: %s", err1.Error())
			}
			if count == 0 {
				return body, common.ApiErrorf400("Nonexistent last message ID: %s", lastId.Hex())
			}
		}
	}

	memberId, err := primitive.ObjectIDFromHex(body.MemberId)
	if err != nil {
		//panic("")
		return body, common.ApiErrorf400("Member ID %s is not a valid ObjectID", body.MemberId)
	}

	member := models.Member{}
	err1 := common.GetOneById(models.MembersCollection(), memberId, &member)
	if err != nil {
		return body, common.ApiErrorf500("Error getting member from collection: %s", err1.Error())
	}
	if member.MemberId.IsZero() {
		return body, common.ApiErrorf400("Member ID with member ID %s was not found", body.MemberId)
	}
	sub, exists := c.Get(common.UserId)
	if !exists {
		return body, common.ApiErrorf500("Unable to get user ID from token")
	}

	if member.Auth0Sub != sub {
		return body, common.ApiErrorf400("Member ID in body did not match token")
	}

	if body.Title == "" {
		return body, common.ApiErrorf400("Title must not be empty")
	}

	return body, nil
}

func (hc HighlightsController) GetHighlightComponent(c *gin.Context) {
	firstMessage, lastMessage, err := hc.ValidateComponentPath(c)
	if err != nil {
		common.RespondWithError(c, err)
		return
	}

	filter := bson.M{"date": bson.M{"$gte": firstMessage.Date, "$lte": lastMessage.Date}, "channel_id": firstMessage.ChannelId}
	messages := make([]models.Message, 0)
	err2 := common.GetAllWhere(models.MessagesCollection(), filter, &messages)
	if err2 != nil {
		common.Respond500(c, err2)
		return
	} else {
		common.RespondSuccess(c, messages, len(messages), false)
	}
}

func (hc HighlightsController) ValidateComponentPath(c *gin.Context) (firstMessage models.Message, lastMessage models.Message, err common.ApiError) {
	componentType := c.Param("type")
	firstMessageId := c.Param("firstMessageId")
	lastMessageId := c.Param("lastMessageId")

	var id1, id2 primitive.ObjectID

	id1, err1 := primitive.ObjectIDFromHex(firstMessageId)
	if err1 != nil {
		return firstMessage, lastMessage, common.ApiErrorf400("Invalid first message ID %s", firstMessageId)
	}

	err1 = common.GetOneById(models.MessagesCollection(), id1, &firstMessage)
	if err1 != nil {
		return firstMessage, lastMessage, common.ApiErrorf500("Error getting first message: %s", err1.Error())
	}
	if firstMessage.MessageId.IsZero() {
		return firstMessage, lastMessage, common.ApiErrorf400("Nonexistent first message ID: %s", firstMessageId)
	}

	if componentType == models.ThreadStartingEnding {
		id2, err1 = primitive.ObjectIDFromHex(lastMessageId)
		if err1 != nil {
			return firstMessage, lastMessage, common.ApiErrorf400("Invalid last message ID %s", lastMessageId)
		}

		err1 = common.GetOneById(models.MessagesCollection(), id2, &lastMessage)
		if err1 != nil {
			return firstMessage, lastMessage, common.ApiErrorf500("Error getting last message: %s", err1.Error())
		}
		if lastMessage.MessageId.IsZero() {
			return firstMessage, lastMessage, common.ApiErrorf400("Nonexistent last message ID: %s", lastMessageId)
		}
	}

	if firstMessage.ChannelId != lastMessage.ChannelId {
		return firstMessage, lastMessage, common.ApiErrorf400("First and last message IDs are from different channels")
	}
	return firstMessage, lastMessage, nil
}
