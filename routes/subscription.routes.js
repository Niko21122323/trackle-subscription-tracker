import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getUserSubscriptions,
  getAllSubscriptions,
  getSubscriptionDetails,
  updateSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", getAllSubscriptions);
subscriptionRouter.get("/:id", authorize, getSubscriptionDetails);
subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.put("/:id", authorize, updateSubscription);
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);
subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

export default subscriptionRouter;
