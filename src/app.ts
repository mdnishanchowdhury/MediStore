import express from "express";
import { categoryRouter } from "./Modules/category/category.route";
const app = express();

app.use(express.json());

app.use("/category", categoryRouter);

app.get("/", (req, res) => {
    res.send("Hello Word!");
})

export default app;