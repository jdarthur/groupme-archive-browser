package controllers

import (
	"fmt"
	"github.com/jdarthur/groupme-archive-browser/v2/server/common"
	"github.com/jdarthur/groupme-archive-browser/v2/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func handleChannelMembers(channel models.ArchiveChannel, members []models.Member) error {
	for _, member := range channel.Members {
		if !memberInDataStore(members, member) {
			fmt.Printf("Need to add member %s to data store.\n", member.MemberId)
			res, err := addMemberToDataStore(member, channel)
			if err != nil {
				return err
			}
			fmt.Printf("Add member %+v to datastore\n", res)

		} else {
			fmt.Printf("Member %s is already in data store.\n", member.MemberId)
			member := getMember(members, member)
			channelFound := false
			for _, existingChannel := range member.Channels {
				if existingChannel == channel.ChannelId {
					channelFound = true
				}
			}

			if !channelFound {
				fmt.Printf("Need to add new channel %s to member %s\n", channel.ChannelId, member.MemberId.Hex())
				err := addChannelToMemberInDataStore(member, channel)
				if err != nil {
					return err
				}
			} else {
				fmt.Printf("Channel %s already present in member %s\n", channel.ChannelId, member.MemberId.Hex())
			}
		}
	}
	return nil
}

func getAllMembersFromDataStore() ([]models.Member, error) {
	members := make([]models.Member, 0)

	err := common.GetAllWhere(models.MembersCollection(), bson.M{}, &members)
	if err != nil {
		return nil, err
	}

	return members, nil
}

func memberInDataStore(members []models.Member, newMember models.ArchiveMember) bool {
	for _, member := range members {
		if member.ArchiveMemberId == newMember.MemberId {
			return true
		}
	}
	return false
}

func getMember(members []models.Member, newMember models.ArchiveMember) models.Member {
	for _, member := range members {
		if member.ArchiveMemberId == newMember.MemberId {
			return member
		}
	}
	return models.Member{}
}

func addMemberToDataStore(member models.ArchiveMember, channel models.ArchiveChannel) (models.Member, error) {

	newMember := models.Member{
		ArchiveMemberId: member.MemberId,
		ImageUrl:        member.ImageUrl,
		Name:            member.Name,
		Aliases:         nil,
		Channels:        []string{channel.ChannelId},
	}

	created, err := common.CreateOne(models.MembersCollection(), &newMember)
	if err != nil {
		return models.Member{}, err
	}
	return *created.(*models.Member), err
}

func addChannelToMemberInDataStore(member models.Member, channel models.ArchiveChannel) error {
	channels := member.Channels
	channels = append(channels, channel.ChannelId)

	_, err := common.SetSubKey(models.MembersCollection(), member.MemberId, "channels", channels)
	return err
}

func addAliasToMemberInDataStore(member models.Member, alias models.Alias) error {
	aliases := member.Aliases
	aliases = append(aliases, alias)

	_, err := common.SetSubKey(models.MembersCollection(), member.MemberId, "aliases", aliases)
	return err
}

func getMembersMapFromDatastore() (map[string]models.Member, error) {
	members := make([]models.Member, 0)
	membersMap := make(map[string]models.Member)

	err := common.GetAll(models.MembersCollection(), &members)
	if err != nil {
		return nil, err
	}

	for _, member := range members {
		membersMap[member.ArchiveMemberId] = member
	}

	return membersMap, nil
}

func memberHasAlias(members map[string]models.Member, archiveUserId string, alias string, channelId primitive.ObjectID) (bool, error) {
	member, ok := members[archiveUserId]
	if !ok {
		return false, common.ApiErrorf500("Member with user ID %s was not found in member map", archiveUserId)
	}

	for _, existingAlias := range member.Aliases {
		if existingAlias.Name == alias && existingAlias.ChannelId == channelId {
			return true, nil
		}
	}

	return false, nil
}
