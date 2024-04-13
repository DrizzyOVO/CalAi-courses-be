import { z } from "zod"; 

export const signupInput = z.object({ 
    email: z.string().min(5).max(30).email(),  
    password: z.string().min(7).max(30),  
})

export type SingupParams = z.infer<typeof signupInput>; 
