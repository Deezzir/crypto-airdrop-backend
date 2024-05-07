import mongoose from "mongoose";
const db = mongoose.connect(process.env.MONGO_DB);
mongoose.connection.on("open", () => {
    console.log("Database connected");
});
export default db;
