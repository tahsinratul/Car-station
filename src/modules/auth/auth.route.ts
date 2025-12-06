import { Router } from "express";
import { handleSignUp, handleSignIn } from "./auth.controller";

const router = Router();

router.post("/signup", handleSignUp);
router.post("/signin", handleSignIn);

export default router;
