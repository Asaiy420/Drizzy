import {z} from "zod";

export const signUpSchema = z.object({
    email: z.string().email({message: "Please enter a valid email"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters"}),
    confirmPasswod: z.string().min(6, {message: "Password must be at least 6 characters"}),
})
.refine((data) => data.password === data.confirmPasswod, {
    message: "Passwords do not match",
    path: ["confirmPasswod"],
})