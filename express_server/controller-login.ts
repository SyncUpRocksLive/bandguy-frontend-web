import { is } from 'date-fns/locale';
import core, { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

let default_users: String = "";
if (!isProduction) {
	default_users = "john|j,jane|j,phil|p,fox|f,mario|m";
}

const USERS: Map<string, string> = new Map((process.env.USERS || default_users).split(",").map((s) => s.trim().split("|") as [string, string]));

if (USERS.size === 0) {
	console.warn("No users defined! Please set the USERS environment variable in the format 'username|password,username2|password2'");
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const user = req.signedCookies?.user;

    // 1. Check if the signed cookie exists and hasn't been tampered with
    // 2. Verify the user is still in your allowed USERS list
    if (user && typeof user === 'string' && USERS.has(user)) {
        // If everything is good, proceed to the next function
		(req as any).currentUser = user;
        return next();
    }

    // Otherwise, block the request
    console.log(`Unauthorized access attempt from cookie: ${user}`);
    res.sendStatus(401);
}

// setup a simple login/cookie
export function useLogin(app: core.Express) {
	if (isProduction) {
		console.log(`Running in production mode. Using users from environment variable or default: ${Array.from(USERS.keys()).join(", ")}`);
	}

	app.get('/user/loggedin', (req, res) => {
		const user = req.signedCookies?.user;

		// Check if user exists, is not false (tamper check), and is allowed
		if (user && typeof user === 'string' && USERS.has(user)) {
			return res.send({ username: user });
		}

		if (user) {
			console.log(`User tampering detected or user '${user}' no longer allowed.`);
		}

		res.sendStatus(401);
	});

	app.post('/user/login', (req, res) => {
		const user = req.body.username;
		const password = req.body.password;

		console.log(`Login attempt for user '${user}' with password '${password}'`);

		if (user && user.length > 0 && password && password.length > 0 && USERS.has(user) && password === USERS.get(user)) {
			console.log(`User '${user}' Logged In`);
			var hour = 3600000;
			res.cookie('user', req.body.username, {
				signed: true,     // This is the "encryption" (signing)
				httpOnly: true,
				sameSite: 'strict',
				secure: isProduction, // Only send cookie over HTTPS in production
				maxAge:  14 * 24 * hour, // 10 days
				path: '/'
			});
			res.sendStatus(200);
		}
		else {
			console.log(`Failed login attempt for user '${req.body.username}' - allowed users are: ${Array.from(USERS.keys()).join(", ")}`);
			res.sendStatus(401);
		}
	});

	app.get('/user/logout', (req, res) => {
		res.clearCookie('user', { path: '/' });
		res.redirect(302, '/');
	});
}
