const routes = {
  '/': renderUsersPage,
  '/create': renderCreatePage,
};

async function router() {
  const hash = window.location.hash.slice(1) || '/';
  const handler = routes[hash];
  
  if (handler) {
    await handler();
  } else {
    window.location.hash = '/';
  }
}

async function renderUsersPage() {
  const app = document.getElementById('app');
  app.innerHTML = '<h1>Пользователи</h1><p>Загрузка...</p>';

  try {
    const res = await fetch('/api/users');
    const users = await res.json();

    if (users.length === 0) {
      app.innerHTML = '<h1>Пользователи</h1><p>Список пуст</p>';
      return;
    }

    const table = `
      <table>
        <thead><tr><th>ID</th><th>Имя</th><th>Email</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.id}</td>
              <td>${escapeHtml(u.name)}</td>
              <td>${escapeHtml(u.email)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    app.innerHTML = `<h1>Пользователи</h1>${table}`;
  } catch (err) {
    app.innerHTML = '<h1>Ошибка</h1><p>Не удалось загрузить пользователей</p>';
    console.error(err);
  }
}

function renderCreatePage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Новый пользователь</h1>
    <form id="create-form">
      <div class="field">
        <label for="name">Имя</label>
        <input type="text" id="name" name="name" required placeholder="Введите имя" />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required placeholder="example@mail.com" />
      </div>
      <button type="submit">Создать</button>
      <a href="#/" data-link>← Назад</a>
    </form>
    <div id="form-status"></div>
  `;

  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        status.textContent = '✅ Пользователь создан!';
        status.style.color = 'green';
        e.target.reset();
        setTimeout(() => { window.location.hash = '/'; }, 1500);
      } else {
        status.textContent = `❌ ${data.error}`;
        status.style.color = 'red';
      }
    } catch (err) {
      status.textContent = '❌ Ошибка сети';
      status.style.color = 'red';
      console.error(err);
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    if (href.startsWith('#')) {
      window.location.hash = href;
    }
  }
});

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
