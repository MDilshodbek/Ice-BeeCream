import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("Mongodb connected successfully");
    const PORT = process.env.PORT ?? 3003;
    app.listen(PORT, function () {
      console.log(`The server is running successfully on port ${PORT}`);
      console.log(`Admin project on http://localhost:${PORT}/adminRouter  \n`);
    });
  })
  .catch((err) => console.log("Error on connecting to Mongodb", err));
