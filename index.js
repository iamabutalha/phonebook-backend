import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import express from "express";
import Person from "./models/person.js";
dotenv.config();

const app = express();

const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((error) => {
    console.log("failed to connect", error);
  });

mongoose.set("strictQuery", false);

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

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformated id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("dist"));
morgan.token("type", function (req, res) {
  return req.headers["content-type"];
});
app.use(errorHandler);

app.get("/api/persons", (request, response) => {
  Person.find({}).then((notes) => {
    response.json(notes);
  });
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

app.delete(`/api/persons/:id`, (request, response, next) => {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send({ error: "malformated id" });
  }

  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        response.status(204).end();
      } else {
        response.status(404).send({ error: "Malfromated id" });
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  // the issue was here which get solved
  if (!body.name) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  if (body.number.length < 8) {
    return response
      .status(400)
      .json({ error: "Lenght of number must be greater than 8" });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      next(error);
    });
});

// const validatePhoneNumber = (number) => {
//   const phoneRegex = /^\d{2,3}-\d+$/;
//   return phoneRegex.test(number);
// };

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  // if (!validatePhoneNumber(body.number)) {
  //   return response.status(400).json({
  //     error: "Invalid Phone Number",
  //   });
  // }
  const person = {
    name: body.name,
    number: body.number || null,
  };

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: "query" },
    { new: true }
  )
    .then((updatedperson) => {
      response.json(updatedperson);
    })
    .catch((error) => {
      next(error);
    });
});

const PORT = process.env.META || 3001;
app.listen(PORT, () => {
  console.log("Server os running on PORT", PORT);
});
