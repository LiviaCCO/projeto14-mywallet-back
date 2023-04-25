import { Router } from "express"
import usuarioRouter from "./usuario.routes.js"
import walletRouter from "./wallet.routes.js"

const router = Router()
router.use(usuarioRouter)
router.use(walletRouter)

export default router