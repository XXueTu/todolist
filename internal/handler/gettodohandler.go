package handler

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"todolist/internal/logic"
	"todolist/internal/svc"
	"todolist/internal/types"
)

func GetTodoHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.TodoReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewGetTodoLogic(r.Context(), svcCtx)
		resp, err := l.GetTodo(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
