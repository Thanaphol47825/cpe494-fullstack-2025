package utils

import (
	"ModEd/core/config"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

type JWTUtils struct{
	JwtConfiguration config.JwtConfiguration
}

func NewJWTUtils(conf config.JwtConfiguration) *JWTUtils {
	return &JWTUtils{
		JwtConfiguration: conf,
	}

}

func (conf JWTUtils) SignSessionId(SessionId string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{
		"session": SessionId,
	})

	return token.SignedString([]byte(conf.JwtConfiguration.Secret))
}

func (conf JWTUtils) UnsignSessionId(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(conf.JwtConfiguration.Secret), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if session, ok := claims["session"].(string); ok {
			return session, nil
		}
		return "", fmt.Errorf("ErrTokenInvalid")
	}

	return "", fmt.Errorf("ErrTokenInvalid")
}
