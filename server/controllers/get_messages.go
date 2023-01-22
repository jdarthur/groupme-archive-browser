package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jdarthur/groupme-archive-browser/common"
	"github.com/jdarthur/groupme-archive-browser/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"math/rand"
	"strconv"
	"time"
)

// Get all messages from the `messages` collection

// Convenience methods to get from date, after message X, paging functionality, random message jump, etc

type GetMessagesController struct{}

func (gmc GetMessagesController) GetAllMessages(c *gin.Context) {

	channelIdFromPath := c.Param("channelId")
	channelId, err := primitive.ObjectIDFromHex(channelIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid channel ID from path: %s", channelIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	reverse := c.Query("reverse") == "true"
	limit, err1 := limitFromQuery(c, 100)
	if err != nil {
		common.RespondWithError(c, err1)
		return
	}

	messages, err := getMessagesWithLimit(channelId, limit, reverse)
	if err != nil {
		common.Respond500(c, err)
		return
	}
	if len(messages) > 0 {
		messages[0].EndOfTheLine = true
	}

	common.RespondSuccess(c, messages, len(messages), false)
}

func (gmc GetMessagesController) GetOneMessage(c *gin.Context) {

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

	if message.MessageId.IsZero() {
		apiErr := common.ApiError404{Message: fmt.Sprintf("Message with ID %s not found", messageId.Hex())}
		common.RespondWithError(c, apiErr)
		return
	}

	common.RespondSuccess(c, message, 1, false)
}

func (gmc GetMessagesController) GetMessagesAround(c *gin.Context) {
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
		e := common.ApiErrorf400("Message ID from path %s was not found", messageIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	limit, err1 := limitFromQuery(c, 100)
	if err != nil {
		common.RespondWithError(c, err1)
		return
	}

	retainMessageId := c.Query("retainMessageId") == "true"

	isEndOfTheLine, err := isFirstOrLastMessage(message)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	messages, err := getMessagesAround(message, limit, isEndOfTheLine, retainMessageId, c.Query("before") == "true")
	if err != nil {
		common.Respond500(c, err)
	} else {
		common.RespondSuccess(c, messages, len(messages), false)
	}
}

func isFirstOrLastMessage(message models.Message) (bool, error) {
	firstMessage, err := getMessagesWithLimit(message.ChannelId, 1, false)
	if err != nil {
		return false, err
	}

	if len(firstMessage) == 1 && firstMessage[0].MessageId == message.MessageId {
		return true, nil
	}

	lastMessage, err := getMessagesWithLimit(message.ChannelId, 1, true)
	if err != nil {
		return false, err
	}

	if len(lastMessage) == 1 && lastMessage[0].MessageId == message.MessageId {
		return true, nil
	}

	return false, nil
}

func (gmc GetMessagesController) FromRandomMessage(c *gin.Context) {

	channelIdFromPath := c.Param("channelId")
	channelId, err := primitive.ObjectIDFromHex(channelIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid channel ID from path: %s", channelIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	hot := c.Query("hot") == "true"

	messages, err := getMessagesWithLimit(channelId, -1, false)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	if hot {
		hotMessages := make([]models.Message, 0)

		// get a random message that has > 1 like
		for _, message := range messages {
			if len(message.LikedBy) > 1 {
				hotMessages = append(hotMessages, message)
			}
		}
		messages = hotMessages
	}

	fromRandomMessage(c, messages)
}

func fromRandomMessage(c *gin.Context, allMessages []models.Message) {
	rand.Seed(time.Now().UnixNano())

	fmt.Printf("choosing random message from list of size %d\n", len(allMessages))

	var message models.Message
	var index = 0

	index = rand.Intn(len(allMessages) - 1)
	message = allMessages[index]

	limit, err1 := limitFromQuery(c, 100)
	if err1 != nil {
		common.RespondWithError(c, err1)
		return
	}

	isFirst, err := isFirstOrLastMessage(message)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	output, err := getMessagesAround(message, limit, isFirst, true, c.Query("before") == "true")
	if err != nil {
		common.Respond500(c, err)
	} else {
		common.RespondSuccess(c, output, len(output), false)
	}
}

var ControversialTimePeriod = 30 * time.Minute
var ControversialThreshold = 50 // consecutive messages in ControversialTimePeriod to mark a message "controversial"

func (gmc GetMessagesController) MostControversial(c *gin.Context) {

	channelIdFromPath := c.Param("channelId")
	channelId, err := primitive.ObjectIDFromHex(channelIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid channel ID from path: %s", channelIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	controversial := make([]models.Message, 0)

	messages, err := getMessagesWithLimit(channelId, -1, false)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	for i, message := range messages {
		if message.Disavowal != nil && message.Disavowal.Disavow == true {
			continue
		}

		if count := messageCountInControversialPeriod(messages, i, message); count > ControversialThreshold {
			fmt.Printf("message count for controversial message %s: %d\n", message.MessageId.Hex(), count)
			controversial = append(controversial, message)
		}
	}

	fmt.Println("controversial message count: ", len(controversial))
	fromRandomMessage(c, controversial)
}

func (gmc GetMessagesController) Nighttime(c *gin.Context) {

	channelIdFromPath := c.Param("channelId")
	channelId, err := primitive.ObjectIDFromHex(channelIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid channel ID from path: %s", channelIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	nighttime := make([]models.Message, 0)

	messages, err := getMessagesWithLimit(channelId, -1, false)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	location, err := time.LoadLocation("America/New_York")
	if err != nil {
		panic(err)
	}

	for _, message := range messages {
		if message.Date.In(location).Hour() > 22 || message.Date.In(location).Hour() < 5 {
			nighttime = append(nighttime, message)
		}
	}

	fromRandomMessage(c, nighttime)
}

func messageCountInControversialPeriod(allMessages []models.Message, startIndex int, startMessage models.Message) int {
	remainingMessages := len(allMessages) - startIndex - 1
	for i := 1; i < remainingMessages; i++ {
		message := allMessages[i+startIndex]
		if startMessage.Date.Sub(message.Date) > ControversialTimePeriod {
			return i
		}
	}
	return -1
}

func (gmc GetMessagesController) FromDate(c *gin.Context) {
	channelIdFromPath := c.Param("channelId")
	channelId, err := primitive.ObjectIDFromHex(channelIdFromPath)
	if err != nil {
		e := common.ApiErrorf400("Invalid channel ID from path: %s", channelIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	limit, err1 := limitFromQuery(c, 100)
	if err != nil {
		common.RespondWithError(c, err1)
		return
	}

	dateFromPath := c.Param("date")
	fmt.Println(channelId, limit, dateFromPath)

	t, err := time.Parse("2006-01-02", dateFromPath)
	if err != nil {
		common.Respond500(c, err)
		return
	}
	before := c.Query("before") != ""
	messages, err := messagesFromDatetime(channelId, t, limit, before, true)
	if err != nil {
		common.Respond500(c, err)
	} else {
		common.RespondSuccess(c, messages, len(messages), false)
	}
}

func (gmc GetMessagesController) GetContext(c *gin.Context) {
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
		e := common.ApiErrorf400("Message ID from path %s was not found", messageIdFromPath)
		common.RespondWithError(c, e)
		return
	}

	limit, err1 := limitFromQuery(c, 5)
	if err != nil {
		common.RespondWithError(c, err1)
		return
	}

	isEndOfTheLine, err := isFirstOrLastMessage(message)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	output := make([]models.Message, 0)
	before, err := getMessagesAround(message, limit, isEndOfTheLine, true, true)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	after, err := getMessagesAround(message, limit, isEndOfTheLine, false, false)
	if err != nil {
		common.Respond500(c, err)
		return
	}

	output = append(output, before...)
	output = append(output, after...)
	common.RespondSuccess(c, output, len(output), false)
}

func limitFromQuery(c *gin.Context, defaultValue int64) (int64, common.ApiError) {
	l := c.Query("limit")
	if l != "" {
		limit, err := strconv.Atoi(l)
		if err != nil {
			e := common.ApiErrorf400("Invalid limit from query: %s", limitFromQuery)
			return -1, e
		}
		return int64(limit), nil
	} else {
		return defaultValue, nil
	}
}

func getMessagesAround(message models.Message, limit int64, endOfTheLine bool, retainMessageId bool, before bool) ([]models.Message, error) {

	messages, err := messagesFromDatetime(message.ChannelId, message.Date, limit, before, retainMessageId)
	if err != nil {
		return nil, err
	}

	firstIndex := 0
	if before {
		firstIndex = len(messages) - 1
	}

	if len(messages) > 0 {
		messages[firstIndex].EndOfTheLine = endOfTheLine
	}

	if before {
		messages = reverse(messages)
	}

	return messages, nil
}

func messagesFromDatetime(channelId primitive.ObjectID, startPoint time.Time, limit int64, before bool, retainMessageId bool) ([]models.Message, error) {

	order := bson.M{"$gt": startPoint}
	if before {
		order = bson.M{"$lt": startPoint}
	}

	//use greater-than-or-equals if we need to retain the provided message ID
	if retainMessageId {
		order = bson.M{"$gte": startPoint}
		if before {
			order = bson.M{"$lte": startPoint}
		}
	}

	filter := bson.M{"date": order}
	messages, err := getMessagesWithWhereAndLimit(channelId, filter, limit, before)
	if len(messages) < int(limit) && len(messages) > 0 {
		messages[0].EndOfTheLine = true
	}

	return messages, err
}

func reverse(input []models.Message) []models.Message {
	output := make([]models.Message, 0)
	for i := len(input) - 1; i >= 0; i-- {
		//fmt.Println(input[i])
		output = append(output, input[i])
	}
	return output
}
