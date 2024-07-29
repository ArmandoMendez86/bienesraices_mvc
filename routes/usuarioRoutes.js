import express from "express";
import { formularioLogin, formularioRegistro, formularioRecuperarPassword, registrar } from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/login", formularioLogin);
router.get("/registro", formularioRegistro);
router.post("/registro", registrar);
router.get("/olvide-password", formularioRecuperarPassword);

export default router;
