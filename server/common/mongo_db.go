package common

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

// Interface that takes a Golang model and converts it to/from a MongoDB collection

// Golang API to e.g. get one, get all, update one, delete, etc.
// Helper functionality to convert from MongoDB UUID to ID passed in API call

var Database *mongo.Database
var ContextDeadline = 10 * time.Second

func OpenDatabaseConnection(URI string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(URI))
	if err != nil {
		return err
	}

	Database = client.Database("groupme")
	return nil
}

type Collection struct {
	CollectionId string
	PrettyName   string
}

type DatabaseModel interface {
	ID() primitive.ObjectID      // string value of `_id` field
	SetID(id primitive.ObjectID) // take string value, convert to bson ID, and set in model struct pointer
}

// GetOneById find a record in Collection c where c.model.ID() == id
func GetOneById(c Collection, id primitive.ObjectID, v interface{}) error {
	filter := ByID(id)
	return GetOneByFilter(c, filter, v)
}

func GetOneByFilter(c Collection, filter bson.M, v interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), ContextDeadline)
	defer cancel()

	res := Database.Collection(c.CollectionId).FindOne(ctx, filter)

	err := res.Err()
	if err != nil {

		if err == mongo.ErrNoDocuments {
			return nil
		}

		return res.Err()
	}
	err = res.Decode(v)
	return err
}

// GetAll get all records in Collection c
func GetAll(c Collection, v interface{}) error {
	return GetAllWhere(c, bson.M{}, v)
}

// GetAllWhere get all records in Collection c using a bson.M filter
func GetAllWhere(c Collection, where bson.M, v interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), ContextDeadline)
	defer cancel()

	cursor, err := Database.Collection(c.CollectionId).Find(ctx, where)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil
		}
		return err
	}
	defer cursor.Close(ctx)
	if err = cursor.All(ctx, v); err != nil {
		return err
	}

	return nil
}

// GetAllWhere get all records in Collection c using a bson.M filter
func GetAllWhereLimitSort(c Collection, where bson.M, v interface{}, limit int64, sort bson.M) error {
	if limit == -1 {
		return GetAllWhere(c, where, v)
	}

	ctx, cancel := context.WithTimeout(context.Background(), ContextDeadline)
	defer cancel()

	opts := options.Find()
	opts.SetLimit(limit)
	opts.SetSort(sort)

	cursor, err := Database.Collection(c.CollectionId).Find(ctx, where, opts)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil
		}
		return err
	}
	defer cursor.Close(ctx)
	if err = cursor.All(ctx, v); err != nil {
		return err
	}

	return nil
}

// CreateOne Create a record
func CreateOne(c Collection, data interface{}) (interface{}, error) {

	ctx, cancel := context.WithTimeout(context.Background(), ContextDeadline)
	defer cancel()

	model, ok := data.(DatabaseModel)
	if !ok {
		return nil, ApiErrorf500("Model %+v of type %T does not conform to DatabaseModel interface", data, data)
	}

	if model == nil {
		return nil, ApiErrorf500("Model %+v of type %T does not conform to DatabaseModel interface", model, model)
	}

	id := NewID()
	model.SetID(id)

	_, err := Database.Collection(c.CollectionId).InsertOne(ctx, data)
	return model, err
}

func UpdateOne(c Collection, id primitive.ObjectID, data interface{}) (interface{}, error) {
	object, err := ObjectExists(c, id)
	if err != nil {
		return nil, err
	}

	return object, ApiNotImplementedError{}
}

func DeleteOne(c Collection, id primitive.ObjectID) (int64, interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), ContextDeadline)
	defer cancel()

	object, err := ObjectExists(c, id)
	if err != nil {
		return 0, nil, err
	}

	filter := ByID(id)

	count, err := Database.Collection(c.CollectionId).DeleteOne(ctx, filter)
	return count.DeletedCount, object, err
}

func SetSubKey(c Collection, id primitive.ObjectID, key string, data interface{}) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), ContextDeadline)
	defer cancel()

	_, err := ObjectExists(c, id)
	if err != nil {
		return -1, err
	}

	filter := ByID(id)

	res, err := Database.Collection(c.CollectionId).UpdateOne(ctx, filter, bson.M{"$set": bson.M{key: data}})
	if err != nil {
		return -1, err
	}

	return res.MatchedCount, err
}

func DeleteSubKey(c Collection, id primitive.ObjectID, key string) (interface{}, error) {
	object, err := ObjectExists(c, id)
	if err != nil {
		return nil, err
	}

	return object, ApiNotImplementedError{}
}

func NewID() primitive.ObjectID {
	return primitive.NewObjectID()
}

func ObjectExists(c Collection, id primitive.ObjectID) (interface{}, error) {
	v := make(map[string]interface{})
	err := GetOneById(c, id, v)
	if err != nil {
		return nil, err
	}

	if len(v) == 0 {
		return nil, ApiErrorf400("Object of type %s with id %s not found", c.PrettyName, id.Hex())
	}
	return v, nil
}

func ByID(id primitive.ObjectID) bson.M {
	return bson.M{"_id": id}
}

func Count(c Collection, filter bson.M) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), ContextDeadline)
	defer cancel()

	return Database.Collection(c.CollectionId).CountDocuments(ctx, filter)
}
