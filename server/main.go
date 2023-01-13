package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/v2/server/common"
	"github.com/jdarthur/groupme-archive-browser/v2/server/controllers"
	"github.com/jdarthur/groupme-archive-browser/v2/server/models"
)

func main() {
	r := gin.Default()

	//err = common.OpenDatabaseConnection("mongodb://192.168.10.6:27018")
	err := common.OpenDatabaseConnection("mongodb://localhost:27018")
	if err != nil {
		panic("unable to open DB connection")
	}

	exists, err := models.DateIndexExists()
	if err != nil {
		panic(err)
	}
	if !exists {
		fmt.Println("Need to create date index on messages collection...")
		err = models.AddDateIndex()
		if err != nil {
			panic(err)
		}
	} else {
		fmt.Println("date index already exists...")
	}

	uploadCtl := controllers.ArchiveUpload{}
	r.POST("/api/archive_upload", uploadCtl.Post)

	channelsCtl := controllers.ChannelController{}
	r.GET("/api/channels", channelsCtl.GetChannels)

	messagesCtl := controllers.GetMessagesController{}
	r.GET("/api/channels/:channelId/messages", messagesCtl.GetAllMessages)
	r.GET("/api/messages/around/:messageId", messagesCtl.GetMessagesAround)
	r.GET("/api/channels/:channelId/messages/random", messagesCtl.FromRandomMessage)
	r.GET("/api/channels/:channelId/messages/from_date/:date", messagesCtl.FromDate)
	r.GET("/api/messages/with_context/:messageId", messagesCtl.GetContext)

	searchCtl := controllers.SearchController{}
	r.POST("/api/channels/:channelId/search/contains_text", searchCtl.SearchForText)

	membersCtl := controllers.MemberController{}
	r.GET("/api/friends", membersCtl.GetMembers)
	r.GET("/api/friends/:friendId", membersCtl.GetOneMember)

	r.Run() // listen and serve on 0.0.0.0:8080
}
