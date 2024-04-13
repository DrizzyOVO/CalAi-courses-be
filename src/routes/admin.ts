import { PrismaClient } from '@prisma/client'
import express from "express"; 
import jwt from "jsonwebtoken"
import { Secret } from 'jsonwebtoken'; 
import { SECRET, adminAuthenticateJwt } from '../middleware/admin'; 
import { signupInput } from '../zodValidation';

const prisma = new PrismaClient()
const router = express.Router(); 

router.get("/me", adminAuthenticateJwt, async (req, res) => {
    const id = req.headers["adminId"] as string;  
    const email = req.headers["email"] as string; 
    const role = req.headers["role"]; 
    const admin = await prisma.admin.findUnique({ 
        where: {
            email: email
        }
    }); 
    if(!admin) { 
        res.status(403).json({ msg: "Admin doesn't exist" }); 
        return; 
    } else { 
        res.json({ 
            adminid: admin.id, 
            email: admin.email, 
        })
    }
}); 


router.post("/signup", async (req, res) => { 

    const parsedInput = signupInput.safeParse(req.body);  

    if(!parsedInput.success){ 
        res.status(411).json({ 
            error: parsedInput.error 
        }); 
        return; 
    }

    const email = req.body.email; 
    const password = req.body.password; 
    const secretCode = req.body.secretCode; 

        const admin = await prisma.admin.findUnique({ 
            where: { 
                email: email, 
            }
        }); 
        if(admin){ 
            if(admin.password == password) { 
                console.log("Admin exists");
                const token = jwt.sign({ email: email, adminId: admin.id, role: 'Admin' }, SECRET, {expiresIn: '1h'}); 
                res.json({ message: "Admin logged in", token, adminId: admin.id, email: admin.email });  
                return;
            } else { 
                res.json({ message: "Incorrect password" })  
                return;
            }
 
        } else { 
            if(secretCode == "admin"){
                const createAdmin = await prisma.admin.create({ 
                    data: {
                        email: email, 
                        password: password, 
                        name: "admin " + email 
                    }
                }); 
                if(createAdmin){ 
                    console.log("Admin created");
                    const token = jwt.sign({ email: email, adminId: createAdmin.id, role: 'Admin' }, SECRET, {expiresIn: '1h'}); 
                    let adminId = null; 
                    jwt.verify(token, SECRET, (err, payload) => {
                        if(err || !payload || typeof payload == "string"){ 
                            return res.sendStatus(403); 
                        }
                        adminId = payload.adminId; 
                    }); 

                    if(adminId){ 
                        res.json({ message: "Admin created", token, email, adminId }); 
                    } else { 
                        res.json({ message: "try again later" }); 
                    }

                } else { 
                    res.json({ message: "try again later" });  
                return; 
                }
            } else { 
                res.json({ message: "wrong code" }); 
            }
        }

}); 


router.post("/login", async (req, res) => {
    const { email, password } = req.body; 
    const adminId = req.headers["adminId"]
    const admin = await prisma.admin.findUnique({  
      where: {
        email: email
      }
    }); 

    if(admin) { 
        if(admin.password == password) { 
            const token = jwt.sign({ email: email, adminId: admin.id, role: 'Admin'}, SECRET, {expiresIn: '1h'});  
            res.json({ message: "Logged in successfully", token, email, adminId }); 
        } else { 
            res.json({ message: "Invalid username or password" }) 
        }
    } else { 
        res.json({ message: "Invalid username or password" }) 
    }

})


router.get("/findid/:adminEmail", async (req, res) => { 

    const email = req.params.adminEmail;  
    const admin = await prisma.admin.findUnique({ 
      where: { 
        email: email
      }
    }); 
  
    if(admin){ 
      res.json({ message: "success", admin }); 
    } else { 
      res.json({ message: "filed" })  
    }
  
  })



router.post('/createCourse', async (req, res) => {
    const { title, description, price, imgLink, published, email } = req.body; 
    const adminId = req.headers["adminId"] as string;  
    console.log("adminId :- " + adminId); 
    const course = await prisma.course.create({ 
        data: {
            title: title,  
            description: description, 
            price: price, 
            imgLink: imgLink, 
            published: published, 
            admin: {
                connect: {
                    // id: parseInt(adminId),
                    email: email 
                }
            }
        }
    }); 

    if(course){ 
        console.log("Course created :- " + course.title + " " + course);  
        res.json({ message: "Course added successfully" }) 
    } else { 
        res.json({ message: "Couldn't add course" }) 
    }

    
}); 



router.put('/courses/:courseId', async (req, res) => {
    const courseId = req.params.courseId as string; 
    const { title, description, price, published, imgLink, email } = req.body; 
    const course = await prisma.course.update({ 
        where: {
            id: parseInt(courseId)
        }, 
        data: {
            title: title, 
            description: description, 
            price: price, 
            imgLink: imgLink, 
            published: published
        }
    })


    if(course){ 
        res.json({ message: "Course updated" });  
        console.log("Course updated");
    }else { 
        res.json({ message: "Error while updating" }); 
    }

})


router.get('/courses/:adminEmail', async (req, res) => {

    const adminId = req.headers["adminId"] as string;  
    const email = req.params.adminEmail; 
    const courses = await prisma.course.findMany({ 
        where: {
            admin: {
                email: email 
            }
        }
    }); 

    const admin = await prisma.admin.findUnique({   
        where: {
            email: email 
        }
    })

    res.json({ courses, adminId: admin?.id, email });  

});


  
router.get('/courses/:courseId/getone', async (req, res) => {

    const courseId = req.params.courseId; 
    const adminId = req.headers["adminId"] as string; 
    const course = await prisma.course.findUnique({ 
        where: {
            id: parseInt(courseId)
        }
    }); 

    res.json({ course, adminId: course?.adminId }); 

});

export default router; 



