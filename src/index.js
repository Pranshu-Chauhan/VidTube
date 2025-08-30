import { app } from './app.js';
import dotenv from 'dotenv'
import connectDB from './db/index.js';

dotenv.config({
    path: "src/.env"
})

let PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err) => {
    console.log("MongoDB connection error", err);
})
