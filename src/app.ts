import express, { type Express, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';

const app: Express = express();
const PORT = 3000;

app.use(express.json());

// Путь к файлу с пользователями (лежит в корне проекта lab1)
const usersFilePath = path.join(process.cwd(), 'users.txt');

interface User {
  id: number;
  name: string;
}

// Читаем файл и превращаем строки "id,name" в массив объектов
function readUsers(): User[] {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, '', 'utf-8');
  }

  const fileContent: string = fs.readFileSync(usersFilePath, 'utf-8');

  if (!fileContent.trim()) {
    return [];
  }

  const lines: string[] = fileContent.trim().split('\n');

  const users: User[] = lines.map((line) => {
    const [id, name] = line.split(',');
    return {
      id: Number(id),
      name: name ? name.trim() : '',
    };
  });

  return users;
}

// Записываем массив пользователей обратно в файл
function writeUsers(users: User[]): void {
  const fileContent = users.map((u) => `${u.id},${u.name}`).join('\n');
  fs.writeFileSync(usersFilePath, fileContent, 'utf-8');
}

// GET /user — получить всех
app.get('/user', (req: Request, res: Response) => {
  const users = readUsers();
  res.json(users);
});

// GET /user/:id — получить одного
app.get('/user/:id', (req: Request, res: Response) => {
  const users = readUsers();
  const userId = Number(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  res.json(user);
});

// POST /user — создать
app.post('/user', (req: Request, res: Response) => {
  const users = readUsers();

  const newUser: User = {
    id: Date.now(),
    name: req.body.name,
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

// PATCH /user/:id — обновить имя
app.patch('/user/:id', (req: Request, res: Response) => {
  const users = readUsers();
  const userId = Number(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  if (req.body.name) {
    user.name = req.body.name;
  }

  writeUsers(users);
  res.json(user);
});

// DELETE /user/:id — удалить
app.delete('/user/:id', (req: Request, res: Response) => {
  const users = readUsers();
  const userId = Number(req.params.id);
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  const [deletedUser] = users.splice(index, 1);
  writeUsers(users);
  res.json(deletedUser);
});

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});