import { Router } from "express"
import { signIn, signUp } from "../controllers/usuarios.js"
import { validateSchema } from "../middlewares/validateSchema.js"
import { registerSchema, loginSchema } from "../schemas/usuarioSchema.js"

const usuarioRouter = Router()

usuarioRouter.post("/cadastro", validateSchema(registerSchema), signUp)
usuarioRouter.post("/", validateSchema(loginSchema), signIn)

export default usuarioRouter