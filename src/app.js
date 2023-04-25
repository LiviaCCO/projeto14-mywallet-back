import bcrypt from 'bcrypt';
import cors from 'cors';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import express from 'express';
import joi from 'joi';
import { MongoClient, ObjectId  } from 'mongodb';
import { v4 as uuid } from 'uuid';


import router from "./routes/index.routes.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use(router)

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))

