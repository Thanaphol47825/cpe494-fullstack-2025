package core

import (
	"context"
	"crypto/rand"
	"time"

	"github.com/redis/go-redis/v9"
)

type SessionManager struct {
	rdb *redis.Client
	ttl time.Duration
	ctx context.Context
}

func NewSessionManager(rdb *redis.Client, ttl time.Duration) *SessionManager {
	return &SessionManager{
		rdb: rdb,
		ttl: ttl,
		ctx: context.Background(),
	}
}

func (sm *SessionManager) Set(userID string) (string, error) {
	sessionID := rand.Text()
	err := sm.rdb.Set(sm.ctx, "session:"+sessionID, userID, sm.ttl).Err()
	if err != nil {
		return "", err
	}
	return sessionID, nil
}

func (sm *SessionManager) Get(sessionID string) (string, bool) {
	userID, err := sm.rdb.Get(sm.ctx, "session:"+sessionID).Result()
	if err != nil {
		return "", false
	}
	return userID, true
}

func (sm *SessionManager) Delete(sessionID string) {
	sm.rdb.Del(sm.ctx, "session:"+sessionID)
}
