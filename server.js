import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import { fileURLToPath } from 'url';
import path from 'path';
import pug from 'pug';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({ logger: true });

app.addContentTypeParser(
  'application/x-www-form-urlencoded',
  { parseAs: 'string' },
  (req, body, done) => {
    const parsed = Object.fromEntries(new URLSearchParams(body));
    done(null, parsed);
  }
);

app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

app.register(fastifyView, {
  engine: { pug },
  root: path.join(__dirname, 'views'),
});

const users = [
  { id: 1, name: 'Николай', email: 'nikolay@example.com' },
  { id: 2, name: 'Алексей', email: 'aleksey@example.com' },
  { id: 3, name: 'Мария',   email: 'maria@example.com' },
];

app.get('/', (request, reply) => {
  return reply.redirect('/users');
});

app.get('/users', (request, reply) => {
  return reply.view('users.pug', { users });
});

app.get('/users/create', (request, reply) => {
  return reply.view('create.pug');
});

app.post('/users', (request, reply) => {
  const { name, email } = request.body;
  const newUser = {
    id: users.length + 1,
    name: name?.trim(),
    email: email?.trim(),
  };
  users.push(newUser);
  return reply.redirect('/users');
});

try {
  await app.listen({ port: 3000 });
  console.log('Сервер запущен: http://localhost:3000');
} catch (err) {
  app.log.error(err);
  process.exit(1);
}