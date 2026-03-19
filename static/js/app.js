const API = '/api';
let tasks = [], categories = [];
let currentFilter = 'all', currentCategoryFilter = null;
let selectedColor = '#6366f1';

const api = {
  async get(url) {
    const r = await fetch(API + url);
    return r.json();
  },
  async post(url, data) {
    const r = await fetch(API + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async patch(url, data) {
    const r = await fetch(API + url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async put(url, data) {
    const r = await fetch(API + url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async delete(url) {
    await fetch(API + url, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
  }
};

function getCookie(name) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : '';
}

async function loadAll() {
  [tasks, categories] = await Promise.all([
    api.get('/tasks/'),
    api.get('/categories/')
  ]);
  render();
}

function render() {
  renderSidebar();
  renderCategorySelect();

  const search = document.getElementById('search').value.toLowerCase();
  const priorityFilter = document.getElementById('priority-filter').value;

  const isKanban = currentFilter === 'all' && !currentCategoryFilter && !priorityFilter && !search;
  document.getElementById('kanban-board').style.display = isKanban ? 'grid' : 'none';
  document.getElementById('task-list-view').style.display = isKanban ? 'none' : 'block';

  if (isKanban) {
    ['todo', 'in_progress', 'done'].forEach(s => {
      const col = tasks.filter(t => t.status === s);
      document.getElementById('col-count-' + s).textContent = col.length;
      const list = document.getElementById('list-' + s);
      list.innerHTML = col.length ? col.map(taskCard).join('') : emptyState(s);
    });
  } else {
    const filtered = tasks.filter(t => {
      if (currentFilter !== 'all' && t.status !== currentFilter) return false;
      if (currentCategoryFilter && t.category !== currentCategoryFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (search && !t.title.toLowerCase().includes(search) && !t.description.toLowerCase().includes(search)) return false;
      return true;
    });
    const list = document.getElementById('filtered-list');
    list.innerHTML = filtered.length ? filtered.map(taskCard).join('') : emptyState();
  }

  document.getElementById('count-all').textContent = tasks.length;
  ['todo', 'in_progress', 'done'].forEach(s => {
    document.getElementById('count-' + s).textContent = tasks.filter(t => t.status === s).length;
  });
  ['urgent', 'high', 'medium', 'low'].forEach(p => {
    document.getElementById('stat-' + p).textContent = tasks.filter(t => t.priority === p).length;
  });
}

function taskCard(t) {
  const due = t.due_date ? formatDue(t.due_date) : '';
  const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done';
  const cat = t.category_detail ? `<span class="badge badge-cat">${esc(t.category_detail.name)}</span>` : '';
  const dueHtml = due ? `<span class="due-badge${isOverdue ? ' overdue' : ''}">${due}</span>` : '';
  return `
    <div class="task-card priority-${t.priority} status-${t.status}" onclick="openEditTask(${t.id})">
      <div class="task-card-title">${esc(t.title)}</div>
      ${t.description ? `<div class="task-card-desc">${esc(t.description)}</div>` : ''}
      <div class="task-card-meta">
        <span class="badge badge-${t.priority}">${t.priority}</span>
        ${cat}${dueHtml}
      </div>
      <div class="task-card-actions" onclick="event.stopPropagation()">
        ${t.status !== 'todo' ? `<button class="action-btn" onclick="moveTask(${t.id},'todo')">To Do</button>` : ''}
        ${t.status !== 'in_progress' ? `<button class="action-btn" onclick="moveTask(${t.id},'in_progress')">Start</button>` : ''}
        ${t.status !== 'done' ? `<button class="action-btn" onclick="moveTask(${t.id},'done')">Done ✓</button>` : ''}
        <button class="action-btn del" onclick="deleteTask(${t.id})">✕</button>
      </div>
    </div>`;
}

function emptyState(status) {
  const msgs = { todo: 'No pending tasks', in_progress: 'Nothing in progress', done: 'No completed tasks' };
  return `<div class="empty-state"><div class="empty-icon">◻</div>${msgs[status] || 'No tasks found'}</div>`;
}

function renderSidebar() {
  document.getElementById('category-list').innerHTML = categories.map(c => `
    <div class="category-item" onclick="filterByCategory(${c.id})">
      <span class="cat-dot" style="background:${c.color}"></span>
      <span>${esc(c.name)}</span>
      <span class="cat-count">${c.task_count}</span>
    </div>`).join('');
}

function renderCategorySelect() {
  const sel = document.getElementById('task-category');
  const val = sel.value;
  sel.innerHTML = '<option value="">No category</option>' +
    categories.map(c => `<option value="${c.id}"${val == c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
}

function formatDue(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `${diff}d left`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function filterByCategory(id) {
  currentCategoryFilter = id;
  currentFilter = 'all';
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-title').textContent = categories.find(c => c.id === id)?.name || 'Category';
  render();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    currentCategoryFilter = null;
    const labels = { all: 'All Tasks', todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
    document.getElementById('page-title').textContent = labels[currentFilter];
    render();
  });
});

document.getElementById('search').addEventListener('input', render);
document.getElementById('priority-filter').addEventListener('change', render);

async function moveTask(id, status) {
  await api.patch(`/tasks/${id}/move/`, { status });
  tasks = tasks.map(t => t.id === id ? { ...t, status } : t);
  render();
  toast('Task moved');
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await api.delete(`/tasks/${id}/`);
  tasks = tasks.filter(t => t.id !== id);
  render();
  toast('Task deleted');
}

function openEditTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  document.getElementById('modal-title-text').textContent = 'Edit Task';
  document.getElementById('task-id').value = t.id;
  document.getElementById('task-title').value = t.title;
  document.getElementById('task-desc').value = t.description;
  document.getElementById('task-priority').value = t.priority;
  document.getElementById('task-status').value = t.status;
  document.getElementById('task-category').value = t.category || '';
  document.getElementById('task-due').value = t.due_date || '';
  document.getElementById('taskModal').classList.add('open');
}

document.getElementById('openTaskModal').addEventListener('click', () => {
  document.getElementById('modal-title-text').textContent = 'New Task';
  document.getElementById('task-id').value = '';
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-status').value = 'todo';
  document.getElementById('task-category').value = '';
  document.getElementById('task-due').value = '';
  document.getElementById('taskModal').classList.add('open');
});

document.getElementById('closeTaskModal').addEventListener('click', () => document.getElementById('taskModal').classList.remove('open'));
document.getElementById('cancelTask').addEventListener('click', () => document.getElementById('taskModal').classList.remove('open'));

document.getElementById('saveTask').addEventListener('click', async () => {
  const id = document.getElementById('task-id').value;
  const data = {
    title: document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    priority: document.getElementById('task-priority').value,
    status: document.getElementById('task-status').value,
    category: document.getElementById('task-category').value || null,
    due_date: document.getElementById('task-due').value || null,
  };
  if (!data.title) { alert('Title is required'); return; }
  if (id) {
    const updated = await api.put(`/tasks/${id}/`, data);
    tasks = tasks.map(t => t.id === parseInt(id) ? updated : t);
    toast('Task updated');
  } else {
    const created = await api.post('/tasks/', data);
    tasks.unshift(created);
    toast('Task created');
  }
  document.getElementById('taskModal').classList.remove('open');
  render();
});

document.getElementById('openCategoryModal').addEventListener('click', () => {
  document.getElementById('cat-name').value = '';
  document.getElementById('categoryModal').classList.add('open');
});
document.getElementById('closeCategoryModal').addEventListener('click', () => document.getElementById('categoryModal').classList.remove('open'));
document.getElementById('cancelCategory').addEventListener('click', () => document.getElementById('categoryModal').classList.remove('open'));

document.getElementById('color-options').addEventListener('click', e => {
  const swatch = e.target.closest('.color-swatch');
  if (!swatch) return;
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  swatch.classList.add('active');
  selectedColor = swatch.dataset.color;
});

document.getElementById('saveCategory').addEventListener('click', async () => {
  const name = document.getElementById('cat-name').value.trim();
  if (!name) { alert('Name is required'); return; }
  const created = await api.post('/categories/', { name, color: selectedColor });
  categories.push(created);
  document.getElementById('categoryModal').classList.remove('open');
  render();
  toast('Category created');
});

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

loadAll();
