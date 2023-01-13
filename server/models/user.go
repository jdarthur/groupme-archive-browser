package models

import "time"

type User struct {
	ID            string      `json:"user_id" bson:"_id"`
	Name          string      `json:"name" bson:"name"`
	Email         string      `json:"email" bson:"email"`
	ArchiveUserId string      `json:"archive_user_id" bson:"archive_user_id"`
	Aliases       []UserAlias `json:"aliases" bson:"aliases"`
}

type UserAlias struct {
	Name      string    `json:"name" bson:"name"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}
