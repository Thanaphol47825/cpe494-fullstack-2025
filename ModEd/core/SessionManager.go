package core

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Session struct {
	UserID string
}

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
	sessionID := uuid.NewString()
	err := sm.rdb.Set(sm.ctx, "session:"+sessionID, userID, sm.ttl).Err()
	if err != nil {
		return "", err
	}
	return sessionID, nil
}

func (sm *SessionManager) Get(sessionID string) (Session, bool) {
	userID, err := sm.rdb.Get(sm.ctx, "session:"+sessionID).Result()
	if err != nil {
		return Session{}, false
	}
	return Session{UserID: userID}, true
}

func (sm *SessionManager) Delete(sessionID string) {
	sm.rdb.Del(sm.ctx, "session:"+sessionID)
}
