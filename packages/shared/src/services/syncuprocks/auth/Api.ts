import { Log } from "@shared/services/Logger";
import { ApiResponseBase } from "@shared/services/syncuprocks/Types";
import { LoggedInStatus } from "./Types";

// FUTURE: Handle slide (keeping web server session alive with periodic pings)
export const GetAuthState = async (slide: boolean = false) : Promise<LoggedInStatus | null> =>  {
	Log('verbose', 'Checking login state...');
	const data = await fetch(`/api/auth/loggedin`, { method: "GET", headers: { "Content-Type": "application/json" }});
	const response: ApiResponseBase<LoggedInStatus> = await data.json();
	Log('verbose', `Checking login state... ${data.status}`);
	if (data.status === 401 || !response.data || response.data.isLoggedIn === false || !response.data.userId || !response.data.username) {
		Log('verbose', 'Checking login state... Unauthorized');
		return null;
	}
	else if (!response.success) {
		Log('error', `Checking login state... unknown failure ${response.errorMessage}`);
		return null;
	}

	return response.data;
}
