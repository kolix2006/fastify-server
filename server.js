import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({ logger: true });

app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
});

app.get('/', (request, reply) => {
  return reply.sendFile('index.html');
});

app.get('/api', (request, reply) => {
  return reply.send({ message: 'Запрос прошел успешно' });
});

try {
  await app.listen({ port: 3000 });
  console.log('Сервер запущен: http://localhost:3000');
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
