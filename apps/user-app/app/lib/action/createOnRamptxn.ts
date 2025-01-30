"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import axios from "axios";


export async function createOnRampTransaction(amount: number, provider: string) {
    const session = await getServerSession(authOptions);
    const token = Math.random().toString();
    const userId = session?.user.id;
    if(!userId) {
        return {
            status: 400,
            message: "User not logged in"
        }
    }
    else if(amount <= 0){
        return {
            status: 400,
            message: "amount is not given"
        }
    }
    else if (!provider){
        return {
            status: 400,
            message: "bank provider is not selected"
        }
    }

    await prisma.onRampTransaction.create({
        data: {
            userId: Number(userId),
            amount: amount,
            status: "Processing",
            startTime: new Date(),
            provider,
            token: token
        }
    })

    // Need a real bank but right now i don't have acces of any bank so i'm sending a dummy request from here to bank webhook
    try {
        await axios.post("http://localhost:3003/hdfcwebhook", {
            token: token,
            user_identifier: Number(userId),
            amount: amount
        })
    }
    catch (err){
        console.log("webhook error");
    }
    

    return {
        message: "On ramp transaction added",
    }
}