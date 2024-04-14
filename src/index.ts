// "@repo/ui": "*",
import express from "express";
import cors from "cors"; 
import adminRoutes from "./routes/admin"; 
import userRoutes from "./routes/user"; 

const PORT = 4000; 
const app = express(); 
app.use(cors()); 
app.use(express.json());  
app.use("/admin", adminRoutes); 
app.use("/user", userRoutes); 


app.listen(PORT, () => {
    console.log(`Example app is listening at http://localhost:${PORT}`)
}); 

