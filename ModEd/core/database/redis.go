package database

import (
	"ModEd/core/config"
	"context"

	"github.com/redis/go-redis/v9"
)

func NewRedis(redisConf config.RedisConfiguration) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     redisConf.Addr,
		Password: redisConf.Password,
		DB:       redisConf.Db,
	})

	if _, err := client.Ping(context.Background()).Result(); err != nil {
		return nil, err
	}

	return client, nil
}
