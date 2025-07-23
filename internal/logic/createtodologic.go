package logic

import (
	"context"

	"todolist/internal/model"
	"todolist/internal/svc"
	"todolist/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateTodoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCreateTodoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateTodoLogic {
	return &CreateTodoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateTodoLogic) CreateTodo(req *types.CreateTodoReq) (resp *types.Todo, err error) {
	todo := &model.Todo{
		Title:       req.Title,
		Description: req.Description,
		Completed:   false,
	}

	err = l.svcCtx.TodoModel.Insert(todo)
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
