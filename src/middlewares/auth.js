import { db } from "../database/database.connection.js"

export async function authValidation(req, res, next) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "") //para retirar o "Bearer" da authorization
    if (!token) return res.sendStatus(401) // se não houver token

    try {
        const session = await db.collection("sessions").findOne({ token }); //verif se token está cadastrado
        if (!session) return res.sendStatus(401)

        res.locals.session = session //verificar

        next()
    } catch (err) {
        res.status(500).send(err.message)
    }
}

    