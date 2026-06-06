import { Router } from "express";
import { getDatabaseStatus } from "../db.js";

export const helloRouter = Router();

helloRouter.get("/", (_request, response) => {
  response.json({
    message: "Hello from the Punt API",
    database: getDatabaseStatus()
  });
});
