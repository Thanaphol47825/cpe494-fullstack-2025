package config

import (
	"log"

	"github.com/spf13/viper"
)

type EnvConfiguration struct {
	App      AppConfiguration
	Database DatabaseConfiguration
}

type AppConfiguration struct {
	Domain string
	Port   int
}

type DatabaseConfiguration struct {
	Dsn string
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
