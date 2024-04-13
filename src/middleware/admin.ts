import jwt from 'jsonwebtoken'; 
export const SECRET = "SecDriSu";  
import { Response, Request, NextFunction } from 'express'; 

export const adminAuthenticateJwt = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization; 
    if(authHeader){ 
        const token = authHeader.split(' ')[1]; 
        jwt.verify(token, SECRET, (err, payload) => {
            // if(err){ 
            //     return res.sendStatus(403); 
            // }
            if(err || !payload || typeof payload == "string"){ 
                return res.sendStatus(403); 
            }
            // if(typeof payload == "string") { 
            //     return res.sendStatus(403); 
            // }
            // if(typeof payload == "string") { 
            //     return res.sendStatus(403); 
            // }
            if(payload.role != "Admin"){ 
                return res.sendStatus(403); 
            }
            req.headers["adminId"] = payload.adminId; 
            req.headers["email"] = payload.email; 
            req.headers["role"] = payload.role; 
            next(); 
        });  

    } else{ 
        console.log("Nooooooooooooo");
        return res.sendStatus(401).json("Nooooooooo");  
    } 
}

