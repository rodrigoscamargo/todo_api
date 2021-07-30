const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);


  if (!user) {
    return response.status(404).json({ error: "user not found" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {

  const { username, name } = request.body;

  users.push({
    id: uuidv4(),
    username,
    name,
    todos: []
  });

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;


  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send();
  }

  todo.deadline = deadline;
  todo.title = title;

  return response.status(200).send();

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send();
  }

  todo.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos = user.todos.filter((todo) => todo.id != id);

  response.json(user.todos);
});

module.exports = app;