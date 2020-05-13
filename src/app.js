const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateUuid(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ message: 'Invalid repository ID.' })
  }

  return next();
}

function verifyIfRepositoryExists(request, response, next) {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(400).json({ message: 'No project with given ID.' });
  } else {
    request.params.index = repositoryIndex;
  }

  return next();
}

function verifyIfBodyParamsArePresent(request, response, next) {
  const { title, url, techs } = request.body;

  if (!title || !url || !techs || techs.length === 0) {
    const message = `Missing information: ${!title ? 'title, ' : ''}${!url ? 'url, ' : ''}${!techs || techs.length === 0 ? 'techs' : ''}.`;

    return response.status(400).json({ message });
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", verifyIfBodyParamsArePresent, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", validateUuid, verifyIfRepositoryExists, (request, response) => {
  const { index } = request.params;
  const { title, url, techs } = request.body;

  repositories[index].title = title;
  repositories[index].url = url;
  repositories[index].techs = techs;

  return response.json(repositories[index]);
});

app.delete("/repositories/:id", validateUuid, verifyIfRepositoryExists, (request, response) => {
  const { index } = request.params;

  repositories.splice(index, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", validateUuid, verifyIfRepositoryExists, (request, response) => {
  const { index } = request.params;

  repositories[index].likes += 1;

  return response.json(repositories[index]);
});

module.exports = app;
