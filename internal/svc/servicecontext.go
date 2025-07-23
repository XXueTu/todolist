package svc

import (
	"todolist/internal/config"
	"todolist/internal/model"
)

type ServiceContext struct {
	Config    config.Config
	TodoModel model.TodoModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	db, err := model.InitDB(c.Database.Source)
	if err != nil {
		panic(err)
	}

	return &ServiceContext{
		Config:    c,
		TodoModel: model.NewTodoModel(db),
	}
}
