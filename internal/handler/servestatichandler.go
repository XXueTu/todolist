package handler

import (
	"net/http"
	"path/filepath"
	"strings"

	"todolist/internal/svc"
)

func ServeStaticHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, filepath.Join("static", "index.html"))
			return
		}
		
		// Remove leading slash for file server
		path := strings.TrimPrefix(r.URL.Path, "/")
		filePath := filepath.Join("static", path)
		
		// Check if file exists
		if _, err := http.Dir("static").Open(path); err != nil {
			// If file doesn't exist, serve index.html for SPA routing
			http.ServeFile(w, r, filepath.Join("static", "index.html"))
			return
		}
		
		// Serve the static file
		http.ServeFile(w, r, filePath)
	}
}
