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

type DisavowController struct{}

type DisavowBody struct {
	Disavow bool   `json:"disavow"`
	Comment string `json:"comment"`
}

func (dc DisavowController) Disavow(c *gin.Context) {
	body := DisavowBody{}
	err := c.Bind(&body)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	messageIdFromPath := c.Param("messageId")
	messageId, err := primitive.ObjectIDFromHex(messageIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid message ID from path: %s", messageIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	message := models.Message{}
	err = common.GetOneById(models.MessagesCollection(), messageId, &message)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	apiErr := userIsCorrect(message, c)
	if apiErr != nil {
		fmt.Println(err)
		common.RespondWithError(c, apiErr)
		return
	}

	d := models.Disavowal{
		Disavow:   body.Disavow,
		Comment:   body.Comment,
		CreatedAt: time.Now(),
	}
	message.Disavowal = &d

	_, err = common.SetSubKey(models.MessagesCollection(), messageId, "disavowal", d)
	if err != nil {
		common.Respond500(c, err)
	} else {
		common.RespondSuccess(c, message, 1, false)
	}
}

func (dc DisavowController) Undisavow(c *gin.Context) {
	messageIdFromPath := c.Param("messageId")
	messageId, err := primitive.ObjectIDFromHex(messageIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid message ID from path: %s", messageIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	message := models.Message{}
	err = common.GetOneById(models.MessagesCollection(), messageId, &message)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	apiErr := userIsCorrect(message, c)
	if err != nil {
		common.RespondWithError(c, apiErr)
		return
	}

	message.Disavowal = nil

	_, err = common.SetSubKey(models.MessagesCollection(), messageId, "disavowal", nil)
	if err != nil {
		common.Respond500(c, err)
	} else {
		common.RespondSuccess(c, message, 1, false)
	}
}

func userIsCorrect(message models.Message, c *gin.Context) common.ApiError {

	auth0Sub, exists := c.Get(common.UserId)
	if !exists {
		return common.ApiError500{Message: "auth0_sub was not found in context"}
	}

	members := make([]models.Member, 0)
	err := common.GetAllWhere(models.MembersCollection(), bson.M{"auth0_sub": auth0Sub}, &members)
	if err != nil {
		return common.ApiError500{Message: err.Error()}
	}

	if len(members) == 0 {
		return common.ApiErrorf400("No members exist with auth0 sub %s", auth0Sub)
	}
	fmt.Println(message.UserId)
	fmt.Println(members[0].MemberId, members[0].ArchiveMemberId, members[0].Auth0Sub, auth0Sub, members[0].Name)
	if message.UserId != members[0].ArchiveMemberId {
		fmt.Println("err9or")
		return common.ApiErrorf400("Token sub %s (member %s) does not match message member ID in message (%s)",
			auth0Sub, members[0].ArchiveMemberId, message.UserId)
	}
	return nil
}
