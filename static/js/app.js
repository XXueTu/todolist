class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadTodos();
        this.updateStats();
        this.renderTodos();
    }

    bindEvents() {
        // Add todo form
        const addForm = document.getElementById('add-todo-form');
        addForm.addEventListener('submit', (e) => this.handleAddTodo(e));

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Edit modal
        const editModal = document.getElementById('edit-modal');
        const closeModal = document.getElementById('close-modal');
        const cancelEdit = document.getElementById('cancel-edit');
        const editForm = document.getElementById('edit-todo-form');

        closeModal.addEventListener('click', () => this.hideEditModal());
        cancelEdit.addEventListener('click', () => this.hideEditModal());
        editForm.addEventListener('submit', (e) => this.handleEditTodo(e));

        // Close modal on backdrop click
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                this.hideEditModal();
            }
        });
    }

    async loadTodos() {
        this.showLoading();
        try {
            const response = await fetch('/api/todos');
            if (response.ok) {
                const data = await response.json();
                this.todos = data.list || [];
            } else {
                this.showError('加载待办事项失败');
            }
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showError('网络错误，请稍后重试');
        }
        this.hideLoading();
    }

    async handleAddTodo(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('todo-title');
        const descriptionInput = document.getElementById('todo-description');
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!title) {
            titleInput.focus();
            return;
        }

        this.showLoading();
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description
                })
            });

            if (response.ok) {
                const newTodo = await response.json();
                this.todos.unshift(newTodo);
                this.updateStats();
                this.renderTodos();
                
                // Clear form
                titleInput.value = '';
                descriptionInput.value = '';
                titleInput.focus();
                
                this.showSuccess('添加成功！');
            } else {
                this.showError('添加失败，请重试');
            }
        } catch (error) {
            console.error('Error adding todo:', error);
            this.showError('网络错误，请稍后重试');
        }
        this.hideLoading();
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.showLoading();
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: todo.title,
                    description: todo.description,
                    completed: !todo.completed
                })
            });

            if (response.ok) {
                const updatedTodo = await response.json();
                const index = this.todos.findIndex(t => t.id === id);
                this.todos[index] = updatedTodo;
                this.updateStats();
                this.renderTodos();
            } else {
                this.showError('更新失败，请重试');
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
            this.showError('网络错误，请稍后重试');
        }
        this.hideLoading();
    }

    showDeleteConfirm(id) {
        // 获取要删除的todo标题
        const todo = this.todos.find(t => t.id === id);
        const message = todo ? `确定要删除"${todo.title}"吗？此操作无法撤销。` : '确定要删除这个待办事项吗？此操作无法撤销。';
        
        document.getElementById('delete-message').textContent = message;
        document.getElementById('delete-modal').style.display = 'flex';
        
        // 绑定确认删除事件
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');
        const closeBtn = document.getElementById('close-delete-modal');
        
        const handleConfirm = () => {
            this.performDelete(id);
            this.hideDeleteConfirm();
            cleanup();
        };
        
        const handleCancel = () => {
            this.hideDeleteConfirm();
            cleanup();
        };
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleCancel);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
    }
    
    hideDeleteConfirm() {
        document.getElementById('delete-modal').style.display = 'none';
    }

    async deleteTodo(id) {
        this.showDeleteConfirm(id);
    }
    
    async performDelete(id) {
        this.showLoading();
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.todos = this.todos.filter(t => t.id !== id);
                this.updateStats();
                this.renderTodos();
                this.showSuccess('删除成功！');
            } else {
                this.showError('删除失败，请重试');
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
            this.showError('网络错误，请稍后重试');
        }
        this.hideLoading();
    }

    showEditModal(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const modal = document.getElementById('edit-modal');
        const idInput = document.getElementById('edit-todo-id');
        const titleInput = document.getElementById('edit-todo-title');
        const descriptionInput = document.getElementById('edit-todo-description');
        const completedInput = document.getElementById('edit-todo-completed');

        idInput.value = todo.id;
        titleInput.value = todo.title;
        descriptionInput.value = todo.description;
        completedInput.checked = todo.completed;

        modal.classList.add('show');
        titleInput.focus();
    }

    hideEditModal() {
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('show');
    }

    async handleEditTodo(e) {
        e.preventDefault();

        const rawId = document.getElementById('edit-todo-id').value;
        const id = parseInt(rawId);
        if (isNaN(id) || id <= 0) {
            console.error('Invalid todo ID in edit form:', rawId);
            this.showError('无效的待办事项ID');
            return;
        }
        const title = document.getElementById('edit-todo-title').value.trim();
        const description = document.getElementById('edit-todo-description').value.trim();
        const completed = document.getElementById('edit-todo-completed').checked;

        if (!title) {
            document.getElementById('edit-todo-title').focus();
            return;
        }

        this.showLoading();
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    completed
                })
            });

            if (response.ok) {
                const updatedTodo = await response.json();
                const index = this.todos.findIndex(t => t.id === id);
                this.todos[index] = updatedTodo;
                this.updateStats();
                this.renderTodos();
                this.hideEditModal();
                this.showSuccess('更新成功！');
            } else {
                this.showError('更新失败，请重试');
            }
        } catch (error) {
            console.error('Error updating todo:', error);
            this.showError('网络错误，请稍后重试');
        }
        this.hideLoading();
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.renderTodos();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('total-count').textContent = total;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('pending-count').textContent = pending;
    }

    renderTodos() {
        const container = document.getElementById('todos-container');
        const emptyState = document.getElementById('empty-state');

        let filteredTodos = this.todos;
        
        if (this.currentFilter === 'completed') {
            filteredTodos = this.todos.filter(t => t.completed);
        } else if (this.currentFilter === 'pending') {
            filteredTodos = this.todos.filter(t => !t.completed);
        }

        if (filteredTodos.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';

        container.innerHTML = filteredTodos.map(todo => this.renderTodoItem(todo)).join('');

        // Bind events for todo items
        container.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                // 如果点击的是子元素，向上查找包含 data-id 的父元素
                let target = e.target;
                while (target && !target.dataset.id) {
                    target = target.parentElement;
                }
                
                const rawId = target ? target.dataset.id : null;
                const id = parseInt(rawId);
                if (isNaN(id) || id <= 0) {
                    console.error('Invalid todo ID:', rawId);
                    this.showError('无效的待办事项ID');
                    return;
                }
                this.toggleTodo(id);
            });
        });

        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rawId = e.target.dataset.id;
                const id = parseInt(rawId);
                if (isNaN(id) || id <= 0) {
                    console.error('Invalid todo ID:', rawId);
                    this.showError('无效的待办事项ID');
                    return;
                }
                this.showEditModal(id);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rawId = e.target.dataset.id;
                const id = parseInt(rawId);
                if (isNaN(id) || id <= 0) {
                    console.error('Invalid todo ID:', rawId);
                    this.showError('无效的待办事项ID');
                    return;
                }
                this.deleteTodo(id);
            });
        });
    }

    renderTodoItem(todo) {
        const createdAt = new Date(todo.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-header">
                    <div class="todo-left">
                        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
                            ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                        <div class="todo-content">
                            <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                            ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                            <div class="todo-meta">
                                <span><i class="fas fa-calendar-alt"></i> ${createdAt}</span>
                            </div>
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="action-btn edit-btn" data-id="${todo.id}" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${todo.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showLoading() {
        document.getElementById('loading').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('show');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => {
            toast.remove();
        });

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add toast styles if not already added
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    z-index: 1001;
                    animation: slideIn 0.3s ease;
                    border-left: 4px solid #667eea;
                }
                .toast-success {
                    border-left-color: #10b981;
                }
                .toast-error {
                    border-left-color: #ef4444;
                }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    color: #374151;
                }
                .toast-success .toast-content i {
                    color: #10b981;
                }
                .toast-error .toast-content i {
                    color: #ef4444;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @media (max-width: 480px) {
                    .toast {
                        left: 10px;
                        right: 10px;
                        top: 10px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});