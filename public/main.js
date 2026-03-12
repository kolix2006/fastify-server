const btn = document.getElementById('requestBtn');
const status = document.getElementById('status');

btn.addEventListener('click', async () => {
  try {
    const response = await fetch('/api');
    const data = await response.json();

    console.log(data.message);
    status.textContent = data.message;
    status.style.color = 'green';
  } catch (err) {
    console.error('Ошибка запроса:', err);
    status.textContent = 'Что-то пошло не так';
    status.style.color = 'red';
  }
});
