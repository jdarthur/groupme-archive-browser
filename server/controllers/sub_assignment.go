package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SubAssignmentController struct{}

type SubAssignmentRequest struct {
	MemberId string `json:"member_id"`
	Auth0Sub string `json:"auth0_sub"`
}

func (sc SubAssignmentController) UpdateSubAssignment(c *gin.Context) {

	req := SubAssignmentRequest{}
	err := c.Bind(&req)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	memberId, err := primitive.ObjectIDFromHex(req.MemberId)
	if err != nil {
		apiErr := common.ApiErrorf400("Invalid member ID: %s", req.MemberId)
		common.RespondWithError(c, apiErr)
		return
	}

	member := models.Member{}
	err = common.GetOneById(models.MembersCollection(), memberId, &member)
	if err != nil {
		apiErr := common.ApiError404{Message: fmt.Sprintf("Member with ID %s not found", req.MemberId)}
		common.RespondWithError(c, apiErr)
	} else {

		_, err = common.SetSubKey(models.MembersCollection(), memberId, "auth0_sub", req.Auth0Sub)
		if err != nil {
			common.Respond500(c, err)
			return
		}

		member.Auth0Sub = req.Auth0Sub
		common.RespondSuccess(c, member, 1, false)
	}
}
