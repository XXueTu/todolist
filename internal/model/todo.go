package model

import (
	"database/sql"
	"time"
)

type Todo struct {
	ID          int64     `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	Completed   bool      `json:"completed" db:"completed"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type TodoModel interface {
	Insert(todo *Todo) error
	FindAll() ([]*Todo, error)
	FindOne(id int64) (*Todo, error)
	Update(todo *Todo) error
	Delete(id int64) error
}

type defaultTodoModel struct {
	conn *sql.DB
}

func NewTodoModel(conn *sql.DB) TodoModel {
	return &defaultTodoModel{
		conn: conn,
	}
}

func (m *defaultTodoModel) Insert(todo *Todo) error {
	query := `INSERT INTO todos (title, description, completed, created_at, updated_at) 
			  VALUES (?, ?, ?, ?, ?)`
	
	now := time.Now()
	todo.CreatedAt = now
	todo.UpdatedAt = now
	
	result, err := m.conn.Exec(query, todo.Title, todo.Description, todo.Completed, now, now)
	if err != nil {
		return err
	}
	
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	
	todo.ID = id
	return nil
}

func (m *defaultTodoModel) FindAll() ([]*Todo, error) {
	query := `SELECT id, title, description, completed, created_at, updated_at FROM todos ORDER BY created_at DESC`
	
	rows, err := m.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var todos []*Todo
	for rows.Next() {
		var todo Todo
		err := rows.Scan(&todo.ID, &todo.Title, &todo.Description, &todo.Completed, &todo.CreatedAt, &todo.UpdatedAt)
		if err != nil {
			return nil, err
		}
		todos = append(todos, &todo)
	}
	
	return todos, nil
}

func (m *defaultTodoModel) FindOne(id int64) (*Todo, error) {
	query := `SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE id = ?`
	
	var todo Todo
	err := m.conn.QueryRow(query, id).Scan(&todo.ID, &todo.Title, &todo.Description, &todo.Completed, &todo.CreatedAt, &todo.UpdatedAt)
	if err != nil {
		return nil, err
	}
	
	return &todo, nil
}

func (m *defaultTodoModel) Update(todo *Todo) error {
	query := `UPDATE todos SET title = ?, description = ?, completed = ?, updated_at = ? WHERE id = ?`
	
	todo.UpdatedAt = time.Now()
	
	_, err := m.conn.Exec(query, todo.Title, todo.Description, todo.Completed, todo.UpdatedAt, todo.ID)
	return err
}

func (m *defaultTodoModel) Delete(id int64) error {
	query := `DELETE FROM todos WHERE id = ?`
	
	_, err := m.conn.Exec(query, id)
	return err
}