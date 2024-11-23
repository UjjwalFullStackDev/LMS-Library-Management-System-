import mongoose from "mongoose";
import 'dotenv/config';

const str = process.env.DB;
if(!str)
    console.log("Missing connection string");

const db = async ()=>{
    try {
        const conn = await mongoose.connect(str);
        if(!conn){
            console.log("DB not connected");
        }else{
            console.log("DB Connected");
        } 
    } catch (e) {
        return console.log(e);
        
    }
}

export default db;