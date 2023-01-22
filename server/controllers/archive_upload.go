package controllers

import (
	"archive/zip"
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"io/ioutil"
	"log"
	"strings"
)

// Take ZIP file as form body
// Parse into folders
// Each folder is a particular channel
// Each folder contains:
//  - message.json: all messages in the channel
//  - conversation.json: some metadata about the channel and its members
//  - likes/*.json: like data. Don't think this is necessary as it's stored in message.json on a per-message basis

// Parse each channel into its own channel ID and store metadata
// For each message in channel:
// 		Add record if it is not already in the `messages` collection where channelId = id

// We don't want to delete existing records because they may have meta-actions which apply to them

// Respond with error if we get an unparseable message or ZIP file

type ArchiveUpload struct{}

func (a ArchiveUpload) Post(c *gin.Context) {

	allChannelsFromDataStore, err := getAllChannelsFromDataStore()
	if err != nil {
		common.Respond500(c, err)
		return
	}

	body := c.Request.Body
	x, err := ioutil.ReadAll(body)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "error": err.Error()})
		return
	}

	fmt.Printf("got %s of data from body\n", getBytesString(len(x)))
	zipReader, err := zip.NewReader(bytes.NewReader(x), int64(len(x)))
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully parsed as a ZIP file")

	channels := make(map[string]UploadResponse)

	// Read all the files from zip archive
	for _, zipFile := range zipReader.File {

		// get the channel ID from the first segment of this filename
		thisChannelId := strings.Split(zipFile.Name, "/")[0]

		// determine if we have added this channel to our map yet
		found := false
		for channelId := range channels {
			if channelId == thisChannelId {
				found = true
			}
		}

		// if we haven't done so, add a new UploadResponse to the map and set its ChannelId
		if !found {
			fmt.Printf("Got new channel %s\n", thisChannelId)
			channels[thisChannelId] = UploadResponse{ChannelId: thisChannelId}
		}

		// Read zip file to []byte
		fmt.Printf("Got file %s", zipFile.Name)
		unzippedFileBytes, err := readZipFile(zipFile)
		if err != nil {
			common.Respond500(c, err)
			return
		}

		fmt.Printf(" (%s)", getBytesString(len(unzippedFileBytes)))

		if strings.Contains(zipFile.Name, conversationJson) {

			res, err := handleConversationJson(unzippedFileBytes, channels[thisChannelId], allChannelsFromDataStore)
			if err != nil {
				common.Respond500(c, err)
				return
			}

			channels[thisChannelId] = res
		} else if strings.Contains(zipFile.Name, messagesJson) {

			res, err := handleMessagesJson(unzippedFileBytes, channels[thisChannelId])
			if err != nil {
				common.Respond500(c, err)
				return
			}

			channels[thisChannelId] = res
		} else {
			fmt.Println(". Unhandled.")
		}

	}

	fmt.Printf("Got %d channels inside provided ZIP file.\n", len(channels))
	common.RespondSuccess(c, channels, 0, true)
}

type UploadResponse struct {
	ChannelId         string                 `json:"channel_id"`
	ChannelName       string                 `json:"channel_name"`
	Members           []models.ArchiveMember `json:"members"`
	MessageCount      int                    `json:"message_count"`
	AddedMessageCount int                    `json:"added_message_count"`
}
