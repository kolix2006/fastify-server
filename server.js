import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool, initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({ logger: true });

app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/', 
});

await initDb();

app.get('/api/users', async (request, reply) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id');
    return reply.code(200).send(result.rows);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'Ошибка получения пользователей' });
  }
});

app.post('/api/users', async (request, reply) => {
  const { name, email } = request.body;
  
  // Валидация
  if (!name?.trim() || !email?.trim()) {
    return reply.code(400).send({ error: 'Name и email обязательны' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name.trim(), email.trim()]
    );
    return reply.code(201).send(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return reply.code(409).send({ error: 'Пользователь с таким email уже существует' });
    }
    request.log.error(err);
    return reply.code(500).send({ error: 'Ошибка создания пользователя' });
  }
});

app.setNotFoundHandler((request, reply) => {
  reply.type('text/html').sendFile('index.html');
});

try {
  await app.listen({ port: 3000 });
  console.log('🚀 Сервер запущен: http://localhost:3000');
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
