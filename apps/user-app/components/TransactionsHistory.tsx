import { Card } from "@repo/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "../app/lib/auth"

export const TransactionsHistory = async ({
    transactions
}: {
    transactions: {
        id: number,
        amount: number,
        fromId: Number,
        from: string,
        to: string,
        time: Date
    }[]
}) => {
    const session = await getServerSession(authOptions);
    const user = Number(session?.user?.id);

    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center pb-8 pt-8">
                No Recent transactions
            </div>
        </Card>
    }
    return <Card title="Recent Transactions">
        <div className="pt-2">
            {transactions.map(t => <div className={`flex justify-between text-black`} key={t?.id}>
                <div>
                    <div className="text-sm">
                        {user === t.fromId? `Send To ${t.to}`:`From ${t.from}`}
                    </div>
                    <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                    </div>
                </div>
                <div className={`flex flex-col justify-center ${user === t.fromId? "text-red-500":"text-green-500"}`}>
                    {user === t.fromId? "-":"+"} Rs {t.amount / 100}
                </div>

            </div>)}
        </div>
    </Card>
}