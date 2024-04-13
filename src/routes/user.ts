import { PrismaClient } from '@prisma/client'
import express from "express"; 
import jwt from "jsonwebtoken"
import { Secret } from 'jsonwebtoken'; 
import { SECRET, authenticateJwt } from '../middleware/user'; 
import { signupInput } from '../zodValidation';

const prisma = new PrismaClient()
const router = express.Router(); 


router.get("/me", authenticateJwt, async (req, res) => {
  const email = req.headers["email"] as string;
  
  if(!email){
    res.json({ 
      email: null, 
      userId: null
  })
  return 
  }
  
  const user = await prisma.user.findUnique({ 
      where: {
          email: email
      }
  }); 
  if(!user) { 
      res.json({ email: null, userId: null }); 
      return; 
  } else { 
      res.json({ 
          email: user.email, 
          userId: user.id 
      })
  }
}); 



router.post('/signup', async (req, res) => {
  const parsedInput = signupInput.safeParse(req.body);  
  const userId = req.headers['userId']; 

  if(!parsedInput.success){ 
      console.log("Errorrrr");
      res.json({ 
          error: parsedInput.error 
      }); 
      return; 
  }

  const email = req.body.email; 
  const password = req.body.password; 

  //user 

  const user = await prisma.user.findUnique({ 
      where: {
          email: email, 
      }        
  }); 

  if(user){ 
    if (user.password == password){
      const token = jwt.sign({ email: email, userId: user.id, role: 'user' }, SECRET, {expiresIn: '1h'}); 
      res.json({ message: 'User already exists', token, email, userId: user.id }); 
    } else {
      res.json({ message: "Incorrect password" }); 
    }
      const token = jwt.sign({ email: email, userId: user.id, role: 'user' }, SECRET, {expiresIn: '1h'}); 
      res.json({ message: 'User already exists', token, email, userId: user.id }); 
  } else { 
      const newUser = await prisma.user.create({ 
          data: {
              email: email, 
              password: password, 
              name: "user " + email,
          }
      }); 
      const token = jwt.sign({ email: newUser.email, userId: newUser.id, role: 'user' }, SECRET, {expiresIn: '1h'}); 
      res.json({ message: 'Created user sucessfully', token, email, userId: newUser.id }); 
  }

}); 




router.post("/login", async (req, res) => {
  const { email, password } = req.body; 
  const userId = req.headers["userId"]
  const user = await prisma.user.findUnique({ 
    where: {
      email: email
    }
  }); 

  // if(user === null) {
  //   res.json({ message: 'Invalid username or password' }); 
  // } else { 
  //   if(user.password == password){ 
  //     const token = jwt.sign({ email: email, userId: user.id, role: 'user'}, SECRET, {expiresIn: '1h'}); 
  //     res.json({ message: "Logged in successfully", token, email, userId }); 
  //   } else { 
  //     res.json({ message: "Incorrect password" })
  //   }
  // }

  if(user){ 
    if(user.password == password){ 
      console.log("User exists");
      const token = jwt.sign({ email: email, userId: user.id, role: 'user'}, SECRET, {expiresIn: '1h'}); 
      res.json({ message: "Logged in successfully", token, email, userId }); 
      return 
    } else { 
      console.log("wrong password"); 
      res.json({ message: "Incorrect password" }) 
      return 
    }
  } else { 
    console.log("invalid"); 
    res.json({ message: 'Invalid username or password' });  
    return 
  }


})





router.get('/courses/:userEmail', async (req, res) => {
  // const courses = await Course.find({published: true});
  // res.json({ courses });

  const email = req.params.userEmail; 

  const courses = await prisma.course.findMany({ 
    where: {
      published: true 
    }
    
  }); 

  const user = await prisma.user.findUnique({ 
    where: {
      email: email 
    }
  }); 

  // const ans = courses.map((course) => {
  //   course.users.map(user => {
  //     if(user.email == email) { 

  //     }
  //   })
  // })

  if(courses){ 
    res.json({ courses, user }); 
  }else{ 
    res.json({ message: "courses not found" }) 
  }

});
 

router.get("/courses/:courseId/:userEmail", async (req, res) => {
  const courseId = req.params.courseId; 
  const userEmail = req.params.userEmail; 
  // const email = req.headers["email"] as string; 
  // const userId = req.headers["userId"]; 

  // console.log("userId :- " + userId);
  // console.log("email :- " + email);

  const course = await prisma.course.findUnique({ 
    where: {
      id: parseInt(courseId) 
    }, 
    include: {
      users: true
    }
  }); 

  const users = course?.users; 
  let theUser = null; 
  users?.map(user => {
    if(user.email == userEmail){ 
      theUser = user.id
    }
  }); 

  if(course) { 
    res.json({ message: "course found", course, theUser }); 
  } else { 
    res.json({ message: "course not found" })
  }

})

router.get("/findid/:userEmail", async (req, res) => { 

  const email = req.params.userEmail;  
  const user = await prisma.user.findUnique({ 
    where: { 
      email: email
    }
  }); 

  if(user){ 
    res.json({ message: "success", user }); 
  } else { 
    res.json({ message: "filed" })  
  }

})


router.post("/courses/:courseId/buy", async (req, res) => {
  
  // console.log("headers existttttt");
  // if(req.headers.authorization){
  //   console.log("headers existttttt");
  //   console.log(req.headers.authorization);
  // }

  console.log("reached in backend");
  const courseId = req.params.courseId; 
  const { email } = req.body; 
  const userId = req.headers["userId"]; 
  const course = await prisma.course.findUnique({ 
    where: {
      id: parseInt(courseId) 
    }
  }); 

  console.log(course);

  if(course){ 
    const user = await prisma.user.findUnique({ 
      where: { 
        email: email, 
      }
    }); 
    if(user && userId && typeof userId === "number"){ 
      await prisma.course.update({ 
        where: {
          id: parseInt(courseId)
        }, 
        data: {
          users: {
            connect: {
              email: email 
            }
          }
        }
      })
      res.json({message: "Bought it" })
    } else { 
      res.status(403).json({ message: 'user not found' });
    }
  } else { 
    res.status(404).json({ message: 'course not found' });
  }

})




router.get('/courses/:courseId/:userId', async (req, res) => {
  console.log("reached in backend");
  const courseId = req.params.courseId; 
  const email = req.headers["email"] as string; 
  const userId = req.headers["userId"]; 
  const course = await prisma.course.findUnique({ 
    where: {
      id: parseInt(courseId) 
    }
  }); 

  console.log(course);

  if(course){ 
    const user = await prisma.user.findUnique({ 
      where: { 
        email: email, 
      }
    }); 
    if(user && userId && typeof userId === "number"){ 
      await prisma.course.update({ 
        where: {
          id: parseInt(courseId)
        }, 
        data: {
          users: {
            connect: {
              email: email 
            }
          }
        }
      })
      res.json({message: "Bought it" })
    } else { 
      res.status(403).json({ message: 'user not found' });
    }
  } else { 
    res.status(404).json({ message: 'course not found' });
  }

});

router.get('/purchasedCourses/:userEmail', async (req, res) => {
  // const user = await User.findOne({ username: req.user.username }).populate('purchasedCourses');
  // if (user) {
  //   res.json({ purchasedCourses: user.purchasedCourses || [] });
  // } else {
  //   res.status(403).json({ message: 'User not found' });
  // }

  const email = req.params.userEmail; 
  const user = await prisma.user.findUnique({ 
    where: {
      email: email
    }, 
    include: { 
      courses: true 
    }

  }); 

  const userId = user?.id

  if(user) { 
    res.json({ user, userId, email, courses: user.courses }); 
  }

});

export default router; 
