import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subsctiptions = await Subscription.find().populate(
      "user",
      "name email",
    );
    res.status(200).json({ success: true, data: subsctiptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: sub });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    const allowedUpdate = [
      "name",
      "price",
      "currency",
      "billingCycle",
      "renewalDate",
      "notes",
    ];

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error("Not authorized to update this subscription");
      error.status = 403;
      throw error;
    }

    allowedUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        subscription[field] = req.body[field];
      }
    });

    await sub.save();

    res.status(200).json({
      success: true,
      message: "Subscription",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error("Not authorized to cancel this subscription");
      error.status = 403;
      throw error;
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      date: subscription,
    });
  } catch (error) {
    next(error);
  }
};
