import mongoose from "mongoose";
mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;
console.log("Connecting to", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("COnnected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting tp MongoDb", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  number: {
    type: String,
    required: false,
    minlength: 8,
    // match: /^\d{2,3}-\d+$/,
    message:
      "Invalid Phone Number format It should be in the format XX-XXXXXXX or XXX-XXXXXXXX.",
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model("Person", personSchema);
