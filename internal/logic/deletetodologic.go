package logic

import (
	"context"

	"todolist/internal/svc"
	"todolist/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type DeleteTodoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDeleteTodoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DeleteTodoLogic {
	return &DeleteTodoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DeleteTodoLogic) DeleteTodo(req *types.TodoReq) error {
	return l.svcCtx.TodoModel.Delete(req.ID)
}
