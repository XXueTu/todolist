package logic

import (
	"context"

	"todolist/internal/svc"
	"todolist/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetTodosLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetTodosLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetTodosLogic {
	return &GetTodosLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetTodosLogic) GetTodos() (resp *types.TodoListResp, err error) {
	todos, err := l.svcCtx.TodoModel.FindAll()
	if err != nil {
		return nil, err
	}

	var list []types.Todo
	for _, todo := range todos {
		list = append(list, types.Todo{
			ID:          todo.ID,
			Title:       todo.Title,
			Description: todo.Description,
			Completed:   todo.Completed,
			CreatedAt:   todo.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:   todo.UpdatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	return &types.TodoListResp{
		List: list,
	}, nil
}
