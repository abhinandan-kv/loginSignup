import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.js";

dotenv.config();

const app = express();

const frontendURL = process.env.FRONTEND_URL;
const PORT = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: [frontendURL],
    credentials: true,
  })
);

//routes
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
