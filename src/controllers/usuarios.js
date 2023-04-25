import { db } from "../database/database.connection.js"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"


export async function signUp(req, res){
    const {name, email, password} = req.body;
    
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
}

export async function signIn (req, res){
    const {email, password} = req.body;
    
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
}
