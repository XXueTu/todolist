package handler

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"todolist/internal/logic"
	"todolist/internal/svc"
)

func GetTodosHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := logic.NewGetTodosLogic(r.Context(), svcCtx)
		resp, err := l.GetTodos()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
