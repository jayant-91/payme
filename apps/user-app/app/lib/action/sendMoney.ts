"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function sendMoney(to: string, amount: number) {
	const session = await getServerSession(authOptions);
	const from = await prisma.user.findFirst({
		where: {
			id: Number(session?.user?.id)
		}
	})
	if (!from?.id) {
		return {
			message: "Error while sending",
		};
	}

	// const fromUser = await prisma.user.findFirst({
	// 	where: {
	// 		id
	// 	}
	// })
	const toUser = await prisma.user.findFirst({
		where: {
			number: to,
		},
	});

	if (!toUser) {
		return {
			status: 303,
			message: "User not found",
		};
	}
	try {
		// There is an issue in RDB while trasuction locking mechanisam dose't work by default like mongodb we have to do that manualy
		// Locking mechanism is a process where included row while transuction locked by himself to block concurent update for data cnsistency
		await prisma.$transaction(async (prisma) => {
			// Prsima dose't suport lock so we need to do row sql query
			await prisma.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from?.id)} FOR UPDATE`;

			const fromBalance = await prisma.balance.findUnique({
				where: { userId: Number(from?.id) },
			});
			if (!fromBalance || fromBalance.amount < amount) {
				// console.log("low balance");
				throw "insufficent balance";
			}
			if(Number(from?.id) === toUser?.id){
				throw "same walet";
			}
			await new Promise((resolve) => setTimeout(resolve, 3000)); //Artifitial delay
			await prisma.balance.update({
				where: { userId: Number(from?.id) },
				data: { amount: { decrement: amount } },
			});

			await prisma.balance.update({
				where: { userId: toUser.id },
				data: { amount: { increment: amount } },
			});

			await prisma.transaction.create({
				data: {
					fromUserId: Number(from?.id),
					fromNumber:from?.number,
					toUserId: toUser.id,
					toNumber:toUser?.number,
					amount: amount,
					timestamp: new Date()
				}
			})
		});
		return {
			message: "succesful",
		};
	} catch (error: unknown) {
		// console.log(error);
		if(error === "insufficent balance"){
			return {
				status: 303,
				message: "insuficeant balance",
			};
		}
		else if(error === "same walet"){
			return {
				status: 303,
				message: "You can't send mony to your own wallet"
			}
		}
		else {
			return {
				status: 303,
				message: "transuction fail"
			}
		}
	}
}
