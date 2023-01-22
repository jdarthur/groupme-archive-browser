# Groupme archive browser

This application uses a Goland/Gin server to serve messages from
a downloaded CSV archive of a Groupme channel and displays the groupchat
in a React-based web application. It implements browsing features not 
present in Groupme such as wildcard search, jump-to-date functionality,
a top messages/images browser, etc. as well as meta-features such as 
message sharing, reactions, and comments.

# Architecture

# Gin/Golang message API
This application does not work use a live feed of messages from a 
Groupme channel. Instead, it requires the administrator to download a 
channel archive as a CSV and upload it using a REST API. This API wraps 
around a MongoDB data store, providing CSV upload functionality and 
an API to read and search messages. It also adds meta-features such as
message sharing, reactions and comments

## Upload API
The `POST /api/message_archive` endpoint takes a CSV as its body, and parses the
CSV into messages. It stores all the available data for each message into a 
MongoDB data store. It returns an error if the CSV was not able to be parsed.

## Messages API
The `GET /api/messages` family of APIs provides read access to the messages 
collection in the MongoDB data store.

### Get messages endpoints
**Get** endpoints include:
 - `GET /api/messages` retrieves all messages ordered by date (ascending)
 - `GET /api/messages/date/:value` retrieves messages chronologically, starting at a certain date
 - `GET /api/messages/:messageId` retrieves messages chronologically, starting at a particular message ID
 - `GET /api/random_message` gets a pseudo-random message ID and returns `GET /api/messages/:messageId`
 - `GET /api/messages/:messageId/next/:count`: get the next e.g. 50 messages before or after message 12345

### Search messages endpoints:
 - `POST /api/messages/text_search`: search for messages using wildcard text search
 - `POST /api/messages/user_search`: search for messages posted by a particular user
 - `POST /api/messages/top`: get most-liked messages with an optional minimum likes and/or date period

## Meta API
The meta-API is a family of CRUD endpoints which allow users to save and interact with archived
messages. These meta-actions are saved in the same MongoDB data store and all related 

### Save messages
A user can save noteworthy messages, a list of which can populate a _highlights_ view in the Web 
UI. This can point to an individual message or relate to a thread starting and ending with two 
message IDs. Any user can save messages and the `GET /api/saved_messages` endpoint will return
all messages saved by any user.

### React to messages
A user can react to messages in a manner similar to Slack or Discord, e.g. hitting the thinking-emoji face
or the heart emoji to a particular message. This reactions should be displayed in the UI in a way that is
distict from the archived "like" count on a message.

### Comment on messages
A user can comment directly on a message to start a post-mortem dialogue on a message thread or provide
additional information to the original message. Users can react or comment in the same way to meta-messages
that they can to archived messages, but the meta-messages must be displayed in a way that conveys their 
distinctness to the immutable archived messages

