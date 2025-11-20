import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPasswird } = req.body;
    const user = await User.findById(req.params.id);
    const updateData = {};

    if (req.params.id !== req.user._id.toString()) {
      const error = new Error("You can only update your own account");
      error.statusCode = 403;
      throw error;
    }
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (name) {
      updateData.name = name;
    }
    if (email) {
      if (email !== user.email) {
        const existingUser = await User.findOne({
          email: email,
          _id: { $ne: req.params.id },
        });

        if (existingUser) {
          const error = new Error("Email already in use");
          error.statusCode = 409;
          throw error;
        }

        updateData.email = email;
      }
    }
    if (newPasswird) {
      if (!currentPassword) {
        const error = new Error(
          "Current password is required to set a new password",
        );
        error.statusCode = 400;
        throw error;
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 401;
        throw error;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPasswird, salt);

      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      const error = new Error("No files provided to update");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (req.params.id !== req.user._id.toString()) {
      const error = new Error("You can only delete your own account");
      error.statusCode = 403;
      throw error;
    }
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    await User.findByIdAndDelete(req.params.id);

    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
