import { getServerSession } from "next-auth";
import { TransactionsHistory } from "../../../components/TransactionsHistory";
import prisma from "@repo/db/client";
import { authOptions } from "../../lib/auth";

async function getTransactions() {
	const session = await getServerSession(authOptions);

	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				OR: [
					{ fromUserId: Number(session?.user?.id) },
					{ toUserId: Number(session?.user?.id) },
				],
			},
		});
		return transactions.map((t) => {
            return {
                id: t.id,
                amount: t.amount,
                fromId: t.fromUserId,
                from: t.fromNumber,
                to: t.toNumber,
                time: t.timestamp
            }
        });
	} catch (err) {
		return [];
	}
}

export default async function () {
    const Transactions = await getTransactions();
	return (
		<div className="w-screen p-8 m-6">
			<TransactionsHistory transactions={Transactions} />
		</div>
	);
}
