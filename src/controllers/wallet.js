import { db } from "../database/database.connection.js"
import dayjs from "dayjs";

export async function transaction(req,res){
    const tpe = req.params;
    const {value, description} = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    //Inserindo data
    const date = dayjs().format('DD/MM');

    let finalValue;
    if(tpe.tipo==="saida"){
        finalValue=value*(-1);
    }else if(tpe.tipo==="entrada"){
        finalValue=value;   
    }
    
    try{
        const session = await db.collection("sessions").findOne({ token });
        const finalTransaction={value:finalValue, description, date, userId: session.userId};
        await db.collection("wallet").insertOne(finalTransaction);
        res.sendStatus(201);

    }catch(err){
        res.status(500).send(console.log(err.message))
    }
}


export async function home(req,res){
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    
    try {
        const session = await db.collection("sessions").findOne({ token });
        const user = await db.collection("users").findOne({_id: session.userId}) // encontrando o id do usuário */
        const userWallet=[];
        const userName=user.name;
        const wallet = await db.collection('wallet').find().toArray();
        
        for(let i=0; i<wallet.length; i++){
            if(session.userId.equals(wallet[i].userId)){ //para comparar objetos
                userWallet.push(wallet[i]);
            }
          }
        res.send({userWallet, userName});
    } catch (err) {
          console.error(err);
          res.sendStatus(500);
    }
  }