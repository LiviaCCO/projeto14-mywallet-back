import cors from 'cors';
import dotenv from 'edotenv';
import express from 'express';
import joi from 'joi';
import { MongoClient } from 'mongodb';

const app =  express();
app.use(express.json());
app.use(cors());
dotenv.config();

//banco de dados
let db;
const mongoClient(process.env.DATABASE_URL);
mongoClient.connect()
    .then(()=>db=mongoClient.db())
    .catch((err)=>console.log(err.message));

//Endpoints
//Cadastro
app.post("/cadastro", (req, res)=>{
    const {name, email, password} = req.body;
    //validação
    const registerSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(3).required()
  });
  const register = {name, email, password}
    const validation = registerSchema.validate(register, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try{
        const users = await db.collection('users').findOne(email);
        if(users) return res.status(409).send("E-mail já cadastrado!")
        await db.collection('users').insertOne(register);
        res.sendStatus(201);
    } catch (err){
        res.status(422).send(err.message)
    }
  


})
const PORT = 5000;
app.listen(PORT, ()=>console.log(`Rodando na porta ${PORT}`));
