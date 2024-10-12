const express = require("express");
const app = express();
const morgan = require("morgan");

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(morgan("tiny"));
app.use(express.static("dist"));
morgan.token("type", function (req, res) {
  return req.headers["content-type"];
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
  console.log(persons);
});

app.get("/info", (request, response) => {
  let count = 0;
  for (let i = 0; i < persons.length; i++) {
    count++;
  }
  let date = new Date();

  let today = date.toUTCString();

  response.send(`<p>App has data for ${count} persons</p>
    <p>${today}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
  let id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
    console.log("Person not found");
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;

  // this code will add all the persons to the newPersons array except if the person.id === to id it will not return it i.e will delete it
  const newPersons = persons.filter((person) => {
    return person.id !== id;
  });
  response.status(204).end();
});

const generateId = () => {
  const maxId =
    persons.length > 0
      ? Math.max(...persons.map((person) => Number(person.id)))
      : 0;
  return String(maxId + 1);
};

app.use(express.json());

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  for (let i = 0; i < persons.length; i++) {
    if (persons[i].name === body.name) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }
  }

  /*
  persons.map((person) => {
    if (person.name === body.name) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }
  });
  */

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  console.log(person);
  response.json(person);
});

const PORT = process.env.META || 3001;
app.listen(PORT, () => {
  console.log("Server os running on PORT", PORT);
});
