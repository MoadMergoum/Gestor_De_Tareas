const API = '/api/tasks';
const PRIORITY_LABEL = { HIGH: 'alta', MEDIUM: 'media', LOW: 'baja' };
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

let tasks = [];
let filter = 'todas';

const $ = id => document.getElementById(id);

function pad(n) { return String(n).padStart(2, '0'); }
function toIso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

const now = new Date();
const TODAY = toIso(now);
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
const TOMORROW = toIso(tomorrow);

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function isLate(task) {
  return !task.completed && task.dueDate && task.dueDate < TODAY;
}

function dateLabel(task) {
  if (!task.dueDate) return 'Sin fecha';
  if (task.dueDate === TODAY) return 'Hoy';
  if (task.dueDate === TOMORROW) return 'Mañana';
  const [, m, d] = task.dueDate.split('-').map(Number);
  const text = d + ' ' + MONTHS[m - 1];
  return isLate(task) ? 'Vencida, ' + text : text;
}

async function loadTasks() {
  const res = await fetch(API);
  tasks = await res.json();
  render();
}

async function updateTask(task, changes) {
  await fetch(API + '/' + task.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...task, ...changes })
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(API + '/' + id, { method: 'DELETE' });
  loadTasks();
}

function renderTask(task) {
  const li = el('li', 'row');

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = task.completed;
  check.setAttribute('aria-label', 'Marcar como hecha');
  check.addEventListener('change', () => updateTask(task, { completed: !task.completed }));

  const mid = el('div', 'mid');
  mid.append(el('p', 'title' + (task.completed ? ' done' : ''), task.title));
  if (task.description) mid.append(el('p', 'desc', task.description));

  const meta = el('div', 'meta');
  meta.append(el('span', 'date' + (isLate(task) ? ' late' : ''), dateLabel(task)));
  if (task.category) meta.append(el('span', 'tag', task.category));
  const priority = task.priority || 'MEDIUM';
  meta.append(el('span', 'badge ' + priority.toLowerCase(), PRIORITY_LABEL[priority]));
  mid.append(meta);

  const del = el('button', 'del', 'Borrar');
  del.addEventListener('click', () => deleteTask(task.id));

  li.append(check, mid, del);
  return li;
}

function render() {
  const query = $('search').value.toLowerCase();
  const shown = tasks.filter(task => {
    if (filter === 'pend' && task.completed) return false;
    if (filter === 'hechas' && !task.completed) return false;
    if (filter === 'alta' && task.priority !== 'HIGH') return false;
    return task.title.toLowerCase().includes(query);
  });

  const list = $('task-list');
  list.textContent = '';
  if (shown.length === 0) {
    list.append(el('li', 'empty', 'No hay tareas que mostrar.'));
  }
  shown.forEach(task => list.append(renderTask(task)));

  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  $('pbar').style.width = pct + '%';
  $('ptxt').textContent = done + ' de ' + total + ' (' + pct + '%)';
  $('m1').textContent = total - done;
  $('m2').textContent = done;
  $('m3').textContent = tasks.filter(t => !t.completed && t.dueDate === TODAY).length;
  $('m4').textContent = tasks.filter(isLate).length;
  $('count').textContent = shown.length + ' de ' + total + ' tareas';
}

$('task-form').addEventListener('submit', async event => {
  event.preventDefault();
  $('error').textContent = '';
  const body = {
    title: $('title').value,
    description: $('description').value,
    dueDate: $('dueDate').value || null,
    priority: $('priority').value,
    category: $('category').value,
    completed: false
  };
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    try {
      const errors = await res.json();
      $('error').textContent = Object.values(errors).join(', ');
    } catch (e) {
      $('error').textContent = 'No se pudo guardar la tarea.';
    }
    return;
  }
  $('task-form').reset();
  loadTasks();
});

$('filters').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  filter = button.dataset.f;
  document.querySelectorAll('#filters .pill').forEach(p => p.classList.toggle('on', p === button));
  render();
});

$('search').addEventListener('input', render);

$('clear').addEventListener('click', async () => {
  await Promise.all(tasks.filter(t => t.completed).map(t => fetch(API + '/' + t.id, { method: 'DELETE' })));
  loadTasks();
});

const todayText = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
$('today').textContent = todayText.charAt(0).toUpperCase() + todayText.slice(1);

loadTasks();
