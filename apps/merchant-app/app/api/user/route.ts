import { NextResponse } from "next/server"
// import  client  from "@repo/db/client";

;

export const GET = async () => {
    // await client.user.create({
    //     data: {
    //         email: "asd",
    //         name: "adsads"
    //     }
    // })
    return NextResponse.json({
        message: "hi there"
    })
}