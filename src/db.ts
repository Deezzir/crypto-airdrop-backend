import mongoose from "mongoose";

const db = mongoose.connect(process.env.MONGO_DB as string);

mongoose.connection.on("open", () => {
    console.log("MongoDB connected");
});

export default db;
