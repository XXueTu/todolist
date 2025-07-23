package logic

import (
	"context"

	"github.com/zeromicro/go-zero/core/logx"
	"todolist/internal/svc"
)

type ServeStaticLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewServeStaticLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ServeStaticLogic {
	return &ServeStaticLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ServeStaticLogic) ServeStatic() error {
	// todo: add your logic here and delete this line

	return nil
}
