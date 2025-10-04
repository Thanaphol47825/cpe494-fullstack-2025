package config

import (
	"log"

	"github.com/spf13/viper"
)

type EnvConfiguration struct {
	App        AppConfiguration        `mapstructure:"app"`
	Database   DatabaseConfiguration   `mapstructure:"database"`
	Redis      RedisConfiguration      `mapstructure:"redis"`
	TimeToLive TimeToLiveConfiguration `mapstructure:"time-to-live"`
}

type AppConfiguration struct {
	Domain string
	Port   int
}

type DatabaseConfiguration struct {
	Dsn string
}

type RedisConfiguration struct {
	Addr     string
	Password string
	Db       int
}

type TimeToLiveConfiguration struct {
	Session uint64
}

func LoadConfig() EnvConfiguration {
	viper.SetConfigName("config")
	viper.AddConfigPath(".")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}
	var configuration EnvConfiguration
	err := viper.Unmarshal(&configuration)
	if err != nil {
		log.Fatalf("unable to decode into struct, %v", err)
	}

	return configuration
}
