const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(c => c.username === username);

  if (!user) {
    return response.status(400).json({ error: 'User not found' });
  }

  request.user = user;
  return next();
}

function checksExistsTodo(request, response, next) {
  const { username } = request.headers;
  const user = users.find(c => c.username === username);

  const { id } = request.params;

  const todo = user.todos.findIndex((obj => obj.id === id));

  if (todo === null || todo === undefined || todo === -1) {
    return response.status(404).json({ error: 'TODO not found' });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  response.status(201).send(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo)
  console.log(user.todos)

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { title, deadline, done } = request.body;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((obj => obj.id === id));
  
  user.todos[todoIndex].title = title
  user.todos[todoIndex].deadline = deadline

  return response.json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((obj => obj.id === id));
  
  user.todos[todoIndex].done = true

  return response.json(user.todos[todoIndex]);}
);

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((obj => obj.id === id));
  user.todos.splice(todoIndex, 1)
  
  return response.status(204).send();
});

module.exports = app;