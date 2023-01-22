package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/controllers"
	"github.com/jdarthur/groupme-archive-browser/models"
	"github.com/joho/godotenv"
	"log"
	"os"
)

func main() {
	r := gin.Default()

	err := godotenv.Load()
	if err != nil {
		fmt.Println("Unable to load .env")
		log.Fatal(err)
	}

	common.Auth0Domain = os.Getenv("AUTH0_DOMAIN")
	common.Auth0Audience = os.Getenv("AUTH0_AUDIENCE")

	devMode := os.Getenv("DEV_MODE") == "true"

	err = initMongoDb()
	if err != nil {
		log.Fatal(err)
	}

	err = common.LoadCerts()
	if err != nil {
		log.Fatal(err)
	}

	uploadCtl := controllers.ArchiveUpload{}
	if devMode {
		r.POST("/api/archive_upload", uploadCtl.Post)
	}

	apiAuth := r.Group("/api", common.AsUser)

	channelsCtl := controllers.ChannelController{}
	apiAuth.GET("/channels", channelsCtl.GetChannels)

	messagesCtl := controllers.GetMessagesController{}
	apiAuth.GET("/channels/:channelId/messages", messagesCtl.GetAllMessages)
	apiAuth.GET("/messages/:messageId", messagesCtl.GetOneMessage)
	apiAuth.GET("/messages/around/:messageId", messagesCtl.GetMessagesAround)
	apiAuth.GET("/channels/:channelId/messages/random", messagesCtl.FromRandomMessage)
	apiAuth.GET("/channels/:channelId/messages/controversial", messagesCtl.MostControversial)
	apiAuth.GET("/channels/:channelId/messages/nighttime", messagesCtl.Nighttime)
	apiAuth.GET("/channels/:channelId/messages/from_date/:date", messagesCtl.FromDate)
	apiAuth.GET("/messages/with_context/:messageId", messagesCtl.GetContext)

	searchCtl := controllers.SearchController{}
	apiAuth.POST("/channels/:channelId/search/contains_text", searchCtl.SearchForText)

	membersCtl := controllers.MemberController{}
	apiAuth.GET("/friends", membersCtl.GetMembers)
	apiAuth.GET("/friends/:friendId", membersCtl.GetOneMember)
	apiAuth.GET("/friends/by_sub/:sub", membersCtl.GetOneMemberByAuth0Sub)

	disavowCtl := controllers.DisavowController{}
	apiAuth.POST("/messages/disavow/:messageId", disavowCtl.Disavow)
	apiAuth.POST("/messages/undisavow/:messageId", disavowCtl.Undisavow)

	highlightsCtl := controllers.HighlightsController{}
	apiAuth.GET("/highlights", highlightsCtl.GetAllHighlights)
	apiAuth.GET("/highlights/:highlightId", highlightsCtl.GetOneHighlight)
	apiAuth.POST("/highlights", highlightsCtl.CreateHighlight)
	apiAuth.GET("/highlight_component/type/:type/from/:firstMessageId/through/:lastMessageId", highlightsCtl.GetHighlightComponent)
	apiAuth.DELETE("/highlights/:highlightId", highlightsCtl.DeleteHighlight)

	r.Run() // listen and serve on 0.0.0.0:8080
}

func initMongoDb() error {
	mongoHost := os.Getenv("MONGO_HOST")
	if len(mongoHost) == 0 {
		mongoHost = "localhost"
	}

	mongoPort := os.Getenv("MONGO_PORT")
	if len(mongoPort) == 0 {
		mongoPort = "27017"
	}
	mongoAddress := "mongodb://" + mongoHost + ":" + mongoPort
	err := common.OpenDatabaseConnection(mongoAddress)
	if err != nil {
		return err
	}

	exists, err := models.DateIndexExists()
	if err != nil {
		panic(err)
	}
	if !exists {
		fmt.Println("Need to create date index on messages collection...")
		err = models.AddDateIndex()
		if err != nil {
			return err
		}
	}
	return nil
}
