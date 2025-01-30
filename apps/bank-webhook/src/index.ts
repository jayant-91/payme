import express from "express";
import db from "@repo/db/client";
const app = express();

// workflow chech
app.use(express.json());

app.post("/hdfcwebhook", async (req, res) => {
	//TODO: Add zod validation here?
	//TODO: HDFC bank should ideally send us a secret so we know this is sent by them
	// TODO: Transuction will only be hapen if onremp transuctino status is prossecing
	const paymentInformation: {
		token: string;
		userId: string;
		amount: string;
	} = {
		token: req.body.token,
		userId: req.body.user_identifier,
		amount: req.body.amount,
	};

	const Transuction = await db.onRampTransaction.findFirst({
		where: {
			token: paymentInformation.token,
		},
	});

	try {
		//Checking if onRanpTransuction status processing then transuction will hapen
		if (Transuction?.status === "Processing") {
			await db.$transaction([
				//Balance table update
				db.balance.update({
					where: {
						userId: Number(paymentInformation.userId),
					},
					data: {
						amount: {
							// You can also get this from your DB
							increment: Number(paymentInformation.amount),
						},
					},
				}),
				//onRampTransaction table update
				db.onRampTransaction.update({
					where: {
						token: paymentInformation.token,
					},
					data: {
						status: "Success",
					},
				}),
			]);
			res.json({
				message: "Captured",
			});
		}
	} catch (e) {
		console.error(e);
		res.status(411).json({
			message: "Error while processing webhook",
		});
	}
});

app.listen(3003);
