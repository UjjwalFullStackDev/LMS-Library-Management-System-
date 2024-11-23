import express from 'express';
const app = express();
import 'dotenv/config';
import db from './utils/database/db.js';
import adminRouter from './utils/routers/admin.route.js';
import facultyRouter from './utils/routers/faculty.route.js';

const port = process.env.PORT || 4000;

import bodyParser from 'body-parser';
import cors from 'cors'


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors('*'));


// ! adminRouter
app.use("/api/v1", adminRouter)

// ! facultyRouter
app.use("/api/v1", facultyRouter)


app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
    db();
})