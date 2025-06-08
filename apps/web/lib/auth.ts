"use server"

import { redirect } from "next/navigation";
import { BACKEND_URL } from "./constants";
import { FormState, LoginFormSchema, SignupFormSchema } from "./type";

export async function signUp(state:FormState ,formdata:FormData):Promise<FormState>{
    const validationFields = SignupFormSchema.safeParse({
        name: formdata.get("name"),
        email: formdata.get("email"),
        password: formdata.get("password"),
    });

    if (!validationFields.success) {
        return{
            error: validationFields.error.flatten().fieldErrors,
        }
    }

    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(validationFields.data),
    });
    if (response.ok) {
        redirect("/auth/signin");
    }else{
        return{
            message: response.status == 409 ? "The user already exists." : response.statusText,
        }
    }
}

export async function signIn(state:FormState, formdata:FormData):Promise<FormState>{
    const validationFields = LoginFormSchema.safeParse({
        email: formdata.get("email"),
        password: formdata.get("password"),
    })

    if (!validationFields.success) 
        return {
            error: validationFields.error.flatten().fieldErrors,
        };

    const response = await fetch(`${BACKEND_URL}/auth/signin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(validationFields.data),
    });

    if (response.ok) {
        const result = await response.json();
        console.log(result);
    }else{
        return {
            message: response.status === 401 ? "Invalid credentials." : response.statusText,
        };
    }
}