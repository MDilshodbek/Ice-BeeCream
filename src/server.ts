import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});
import mongoose from "mongoose";
import server from "./app";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("Mongodb connected successfully");
    const PORT = Number(process.env.PORT ?? 3003);
    const onListen = function () {
      console.log(`The server is running successfully on port ${PORT}`);
      console.log(`Admin project on http://localhost:${PORT}/adminRouter  \n`);
    };
    // HOST=127.0.0.1 in production keeps the port private (only Nginx reaches it).
    if (process.env.HOST) server.listen(PORT, process.env.HOST, onListen);
    else server.listen(PORT, onListen);
  })
  .catch((err) => console.log("Error on connecting to Mongodb", err));
