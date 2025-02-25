import express from "express";
import { router } from "./routes/v1";

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use("/api/v1", router);

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
