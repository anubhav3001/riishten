import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import {createUser, getUserByID} from "@/app/neo4j.action";

export default async function CallbackPage() {
    const { isAuthenticated, getUser } = getKindeServerSession();

    // Check if the user is authenticated
    if (!(await isAuthenticated())) {
        return redirect(
            "/api/auth/login?post_login_redirect_url=http://localhost:3000/callback"
        );
    }

    // Get the authenticated user
    const user = await getUser();

    if (!user) {
        return redirect(
            "/api/auth/login?post_login_redirect_url=http://localhost:3000/callback"
        );
    }

    // Check if the user exists in the database
    const dbUser = await getUserByID(user.id);

    // If the user doesn't exist, create a new user
    if (!dbUser) {
        await createUser({
            applicationId: user.id,
            email: user.email!,
            firstname: user.given_name!,
            lastname: user.family_name ?? undefined,
        });
    }

    // Redirect to the home page
    return redirect("/");
}
