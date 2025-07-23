package logic

import (
	"context"

	"todolist/internal/svc"
	"todolist/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateTodoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateTodoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateTodoLogic {
	return &UpdateTodoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateTodoLogic) UpdateTodo(req *types.UpdateTodoReq) (resp *types.Todo, err error) {
	todo, err := l.svcCtx.TodoModel.FindOne(req.ID)
	if err != nil {
		return nil, err
	}

	if req.Title != "" {
		todo.Title = req.Title
	}
	if req.Description != "" {
		todo.Description = req.Description
	}
	todo.Completed = req.Completed

	err = l.svcCtx.TodoModel.Update(todo)
	if err != nil {
		return nil, err
	}

	return &types.Todo{
		ID:          todo.ID,
		Title:       todo.Title,
		Description: todo.Description,
		Completed:   todo.Completed,
		CreatedAt:   todo.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:   todo.UpdatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}
