import express from "express";
import cors from "cors";

import { errorHandler } from "@middlewares/errorHandler.js";
import { userRouter } from "@modules/user/user.routes.js";
import { itemRouter } from "@modules/item/item.routes.js";
import { loanRouter } from "@modules/loan/loan.routes.js";
import { authRouter } from "@modules/auth/auth.routes.js";
import { clientRouter } from "@modules/client/client.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", userRouter);
app.use("/item", itemRouter);
app.use("/loan", loanRouter);
app.use("/auth", authRouter);
app.use("/client", clientRouter);

app.use(errorHandler);

export { app };
