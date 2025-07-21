import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/errors";

const memberService = new MemberService();

const adminController: T = {};
adminController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (error) {
    console.log("Error, goHome", error);
    res.redirect("/adminRouter");
  }
};

adminController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.render("signup");
  } catch (error) {
    console.log("Error, signupPage", error);
    res.redirect("/adminRouter");
  }
};

adminController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("login");
  } catch (error) {
    console.log("Error, loginPage", error);
    res.redirect("/adminRouter");
  }
};

adminController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processSignup");
    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.ADMIN;
    const result = await memberService.processSignup(newMember);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/adminRouter/product/all");
    });
  } catch (error) {
    const message =
      error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/adminRouter/signup')</script>`
    );
  }
};

adminController.processLogin = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processLogin");
    const input: LoginInput = req.body,
      result = await memberService.processLogin(input);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/adminRouter/product/all");
    });
  } catch (error) {
    const message =
      error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/adminRouter/login')</script>`
    );
  }
};

adminController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout");
    req.session.destroy(function () {
      res.redirect("/adminRouter");
    });
  } catch (error) {
    res.redirect("/adminRouter");
  }
};

adminController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");
    const result = await memberService.getUsers();
    console.log("result:", result);

    res.render("users", { users: result });
  } catch (error) {
    console.log("Error, getUsers", error);
    res.redirect("/adminRouter/login");
  }
};

adminController.updateChoosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChoosenUser");
    const result = await memberService.updateChoosenUser(req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (error) {
    console.log("Error, updateChoosenUser", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

adminController.checkAuthSession = async (req: AdminRequest, res: Response) => {
  try {
    console.log("checkAuthSession");
    if (req.session?.member)
      res.send(
        `<script> alert( Hi "${req.session.member.memberNick}")</script>`
      );
    else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}")</script>`);
  } catch (error) {
    res.send(error);
  }
};

adminController.verifyAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.member?.memberType === MemberType.ADMIN) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script> alert("${message}"); window.location.replace('/adminRouter/login');</script>`
    );
  }
};

export default adminController;
