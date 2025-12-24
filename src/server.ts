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
    const PORT = process.env.PORT ?? 3003;
    server.listen(PORT, function () {
      console.log(`The server is running successfully on port ${PORT}`);
      console.log(`Admin project on http://localhost:${PORT}/adminRouter  \n`);
    });
  })
  .catch((err) => console.log("Error on connecting to Mongodb", err));
