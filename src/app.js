import bcrypt from 'bcrypt';
import cors from 'cors';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import express from 'express';
import joi from 'joi';
import { MongoClient, ObjectId  } from 'mongodb';
import { v4 as uuid } from 'uuid';
dotenv.config();

const app =  express();
app.use(express.json());
app.use(cors());


//banco de dados
let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);
mongoClient.connect().then(()=> db = mongoClient.db() ).catch((err)=>console.log(err.message)); 

//Schemas
const registerSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});
const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});
const transactionSchema = joi.object({
    value: joi.number().positive().precision(2).required(),
    description: joi.string().required()
});

//Endpoints

//Cadastro
app.post('/cadastro', async (req, res)=>{
    const {name, email, password} = req.body;
    //validação
    const register = {name, email, password}
    const validation = registerSchema.validate(register, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    //Para criptografar a senha
    const criPassword = bcrypt.hashSync(password, 10);
    const userRegister = {name, email, password: criPassword};

    try{
        const users = await db.collection('users').findOne({email});
        if(users) return res.status(409).send("E-mail já cadastrado!")
        await db.collection('users').insertOne(userRegister);
        res.sendStatus(201);
    } catch (err){
        res.status(422).send(err.message)
    }
});
//Login
app.post('/', async (req, res)=>{
    const {email, password} = req.body;
    //validação
    const register = {email, password}
    const validation = loginSchema.validate(register, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    //Verificação de email e senha
    try{
        //dentre os usuários, encontrar o email
        const user = await db.collection('users').findOne({email});
       
        if(user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();
        	await db.collection("sessions").insertOne({userId: user._id,token})
            return res.send(token);
        } else if (!user){
            return res.status(404).send("E-mail não cadastrado!")
        } else{
            return res.status(401).send("Senha inválida!")
        }
    }catch (err){
            res.status(500).send(err.message)
    }
});
//adicionando transações
app.post("/nova-transacao/:tipo", async (req,res) => {
    const tpe = req.params;
    console.log(tpe.tipo)
    const {value, description} = req.body;
    const { authorization } = req.headers;
    //autenticação
    const token = authorization?.replace('Bearer ', ''); //para retirar o "Bearer" da authorization
    if(!token) return res.sendStatus(401); // se não houver token
    const session = await db.collection("sessions").findOne({ token }); //verif se token está cadastrado     
    if (!session) return res.sendStatus(401); 
    /* const user = await db.collection("users").findOne({ 
        _id: session.userId 
    }) // encontrando o id do usuário */
    //Inserindo data
    const date = dayjs().format('DD/MM');
    console.log(date)
    //validação
    const transaction = {value, description}
    const validation = transactionSchema.validate(transaction, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    let finalValue;
    if(tpe.tipo==="saida"){
        finalValue=value*(-1);
    }else if(tpe.tipo==="entrada"){
        finalValue=value;   
    }
    
    try{
        const finalTransaction={value:finalValue, description, date, userId: session.userId};
        console.log(finalTransaction);
        await db.collection("wallet").insertOne(finalTransaction);
        res.sendStatus(201);

    }catch(err){
        res.status(500).send(console.log(err.message))
    }
});
app.get("/home", async (req,res) => {
    const { authorization } = req.headers;
    //autenticação
    const token = authorization?.replace('Bearer ', ''); //para retirar o "Bearer" da authorization
    if(!token) return res.sendStatus(401); // se não houver token
    const session = await db.collection("sessions").findOne({ token }); //verif se token está cadastrado     
    if (!session) return res.sendStatus(401); 
    const user = await db.collection("users").findOne({ 
        _id: session.userId 
    }) // encontrando o id do usuário */
    
    try {
        const userWallet=[];
        const userName=user.name;
        const wallet = await db.collection('wallet').find().toArray();
        for(let i=0; i<wallet.length; i++){
            if(wallet[i].userId===session.userId){
                userWallet.push(wallet[i]);
            }
          }
        res.send({userWallet, userName});
    } catch (err) {
          console.error(err);
          res.sendStatus(500);
    }
  });

const PORT = 5000;
app.listen(PORT, ()=>console.log(`Rodando na porta ${PORT}`));
