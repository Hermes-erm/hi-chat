import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/User";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const createUser = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  let isUserExist = await User.exists({ userName: name });
  if (isUserExist) {
    res.status(409).json({ message: "user-name already exists", success: false });
    return;
  }

  await new User({ userName: name, password }).save();

  res.status(201).json({ message: "User created", success: true });
};

const login = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  let user = await User.findOne({ userName: name, password });
  if (!user) {
    res.status(401).json({ message: "User not found", success: false });
    return;
  }

  let token = jwt.sign({ _id: user._id, name: name }, process.env.JWT_SECRET_KEY || "");

  res
    .cookie("_token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: false,
    })
    .json({ token: token, data: user, message: "Logged in successfully, token sent!", success: true });
};

export { createUser, login };
