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

// mongoose.connect('mongodb://127.0.0.1:27017/test', { dbName: "TodoProjGhub" }); 

app.listen(PORT, () => {
    console.log(process.env.DATABASE_URL);
    console.log(`Example app is listening at http://localhost:${PORT}`)
}); 


// app.get("/", (req, res) => { 
//     res.json({ Msg: "reached here" }); 
// })


// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// async function main() {

    // await prisma.user.create({ 
    //     data: {
    //         name: "gg", 
    //         email: "gg",   
    //     }
    // })

    // await prisma.course.create({  
    //     data: {
    //         title: "smth2", 
    //         description: "smth2", 
    //         price: 999, 
    //         published: false, 
    //         admin: {
    //             connect: {
    //                 id: 1
    //             }
    //         }, 
    //         allCourses: {
    //             connect: {
    //                 id: 1 
    //             }
    //         }
    //     }
    // })

    // await prisma.course.update({
    //     where: {
    //         id: 1
    //     }, 
    //     data: {
    //         users: {
    //             connect: {
    //                 id: 2
    //             }
    //         }
    //     }
    // })

    // const ans = await prisma.course.findMany({ 
    //     include: { 
    //         users: true
    //     }
    // })

    // ans.map(course => console.log(course))

//     const admin = await prisma.user.findUnique({ 
//         where: {
//             id: 1
//         }, 
//         include: {
//             courses: true
//         }
//     })
    
//     console.log(admin); 

// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })



// show collections / show tables => shows all the models  
// db.getCollection('admins').find();  => specifically select the model and .query