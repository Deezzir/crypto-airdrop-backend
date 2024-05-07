import mongoose from "mongoose";

const db = mongoose.connect(process.env.MONGO_DB as string);

mongoose.connection.on("open", () => {
  console.log("Database connected");
});

export default db;
