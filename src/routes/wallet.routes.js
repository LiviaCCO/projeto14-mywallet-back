import { Router } from "express"
import { transaction, home } from "../controllers/wallet.js"
import { validateSchema } from "../middlewares/validateSchema.js"
import { transactionSchema } from "../schemas/transactionSchema.js"
import { authValidation } from "../middlewares/auth.js"

const walletRouter = Router()

walletRouter.use(authValidation)

walletRouter.post("/nova-transacao/:tipo", validateSchema(transactionSchema), transaction)
walletRouter.get("/home", home)

export default walletRouter


