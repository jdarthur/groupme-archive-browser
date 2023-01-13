package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/v2/server/common"
	"github.com/jdarthur/groupme-archive-browser/v2/server/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MemberController struct{}

func (mc MemberController) GetMembers(c *gin.Context) {
	members := make([]models.Member, 0)
	output := make([]models.Member, 0)
	err := common.GetAll(models.MembersCollection(), &members)
	if err != nil {
		common.Respond500(c, err)
	} else {

		for _, member := range members {
			count, err := countMessagesForMember(member)
			if err != nil {
				common.Respond500(c, err)
			}
			member.MessageCount = count
			output = append(output, member)
		}

		common.RespondSuccess(c, output, len(output), false)
	}
}

func (mc MemberController) GetOneMember(c *gin.Context) {

	idFromPath := c.Param("friendId")
	friendId, err := primitive.ObjectIDFromHex(idFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid friend ID from path: %s", idFromPath)
		common.RespondWithError(c, e)
		return
	}

	member := models.Member{}
	err = common.GetOneById(models.MembersCollection(), friendId, &member)
	if err != nil {
		common.Respond500(c, err)
	} else {

		count, err := countMessagesForMember(member)
		if err != nil {
			common.Respond500(c, err)
		}
		member.MessageCount = count
		common.RespondSuccess(c, member, 1, false)
	}
}
