import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions, DefaultSession } from "next-auth";
// import { create } from "domain";

// Extend the default Session type to include a custom `id` field
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}
}

// Define a type for user credentials
type Credentials = {
	phone: string;
	password: string;
};

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				phone: {
					label: "Phone number",
					type: "text",
					placeholder: "1231231231",
					required: true,
				},
				password: {
					label: "Password",
					type: "password",
					required: true,
				},
			},
			// Authentication logic
			async authorize(credentials: Credentials | undefined) {
				if (!credentials) {
					throw new Error("Missing credentials");
				}

				const hashedPassword = await bcrypt.hash(credentials.password, 10);

				const existingUser = await db.user.findFirst({
					where: { number: credentials.phone },
				});

				if (existingUser) {
					const passwordValidation = await bcrypt.compare(
						credentials.password,
						existingUser.password
					);
					if (passwordValidation) {
						return {
							id: existingUser.id.toString(),
							name: existingUser.name,
							email: existingUser.number,
						};
					}
					return null;
				}

				try {
					const user = await db.user.create({
						data: {
							number: credentials.phone,
							password: hashedPassword,
							Balance: {       
								create: {
								  amount: 0,
								  locked: 0,
								}
							}
						}
						
					});

					return {
						id: user.id.toString(),
						name: user.name,
						email: user.number,
					};
				} catch (e) {
					console.error(e);
					return null;
				}
			},
		}),
	],
	secret: process.env.JWT_SECRET || "secret",
	callbacks: {
		// Add user ID to session
		async session({ token, session }: { token: any; session: any }) {
			if (token?.sub) {
				session.user = {
					...session.user,
					id: token.sub,
				};
			}
			return session;
		},
	},
};

