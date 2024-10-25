import dotenv from "dotenv";
dotenv.config();
const mongoose = require("mongoose");
const axios = require("axios");
const password = process.argv[2];
// password is fullstackopen1

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then((result) => {
    console.log(
      `added ${process.argv[3]} number ${process.argv[4]} to phonebook`
    );
    mongoose.connection.close();
  });

  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
}

const fetchAndSave = async () => {
  try {
    const respose = await axios.get(`http://localhost:3001/api/persons/`);
    const persons = await respose.data;
    if (Array.isArray(persons) && persons.length > 0) {
      await Person.insertMany(persons);
    } else if (persons && typeof persons === "object") {
      await Person.create(persons);
    }

    console.log("Data successfully saved to MongoDB");
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
};

if (process.argv.length === 4 && process.argv[3] === "fetchAPI") {
  fetchAndSave();
}
