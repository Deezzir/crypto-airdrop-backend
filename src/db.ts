import mongoose from "mongoose";
import * as common from "./common.js";

const db = mongoose.connect(process.env.MONGO_DB as string);

mongoose.connection.on("open", () => {
    common.log("MongoDB connected");
});

export default db;
