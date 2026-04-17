export type ViewArea = 'Home' | 'HostSets' | 'HostSetView' | 'SoloSets' | 'SoloSetView' | 'Guest';

interface Route {
	area: ViewArea;
	params: string[];
}

// --- helpers ---

function parseHash(): Route {
	const hash = window.location.hash.replace("#", "");
	const parts = hash.split("/");

	if (parts.length === 0 || parts[0] === '') {
		return { area: "Home", params: [] };
	}

	const area = parts[0];
	const params = parts.slice(1);

	if (area === 'host' && params.length >= 1 && params[0] === 'sets') {
		if (params.length >= 2) {
			return { area: "HostSetView", params: [params[1]] };
		} else {
			return { area: "HostSets", params: [] };
		}
	} else if (area === 'solo' && params.length >= 1 && params[0] === 'sets') {
		if (params.length >= 2) {
			return { area: "SoloSetView", params: [params[1]] };
		} else {
			return { area: "SoloSets", params: [] };
		}
	} else if (area === 'guest') {
		return { area: "Guest", params: [] };
	} else if (isValidView(area)) {
		return { area, params };
	}

	return { area: "Home", params: [] };
}

function toHash(route: Route) {
	let hash = '#';
	if (route.area === 'Home') {
		return '#';
	} else if (route.area === 'HostSets') {
		hash += 'host/sets';
	} else if (route.area === 'HostSetView') {
		hash += `host/sets/${route.params[0] || ''}`;
	} else if (route.area === 'SoloSets') {
		hash += 'solo/sets';
	} else if (route.area === 'SoloSetView') {
		hash += `solo/sets/${route.params[0] || ''}`;
	} else if (route.area === 'Guest') {
		hash += 'guest';
	} else {
		hash += route.area;
		if (route.params.length) {
			hash += '/' + route.params.join('/');
		}
	}
	return hash;
}

function isValidView(name: string): name is ViewArea {
	return ['Home', 'HostSets', 'HostSetView', 'SoloSets', 'SoloSetView', 'Guest'].includes(name);
}

// --- router state ---

class Router {
	route = $state<Route>(parseHash());

	constructor() {
		const sync = () => {
			this.route = parseHash();
		};

		window.addEventListener("popstate", sync);
		window.addEventListener("hashchange", sync);
	}

	navigate(area: ViewArea, params: string[] = []) {
		const next: Route = { area, params };
		const hash = toHash(next);

		// avoid duplicate pushes
		if (window.location.hash === hash) return;

		history.pushState(null, "", hash);

		// update state immediately (no wait for event)
		this.route = next;
	}

	replace(area: ViewArea, params: string[] = []) {
		const next: Route = { area, params };
		const hash = toHash(next);

		history.replaceState(null, "", hash);
		this.route = next;
	}

	linkTo(area: ViewArea, params: string[] = []) {
		const hash = toHash({ area, params });

		return {
			href: hash,
			onclick: (e: MouseEvent) => {
				// allow new tab, etc.
				if (
					e.metaKey ||
					e.ctrlKey ||
					e.shiftKey ||
					e.altKey ||
					e.button !== 0
				) return;

				e.preventDefault();
				router.navigate(area, params);
			}
		};
	}

	back(fallbackArea: ViewArea = 'Home') {
        // If there is history to go back to within the session
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Otherwise, just reset to a safe view
            this.replace(fallbackArea);
        }
    }
}

export const router = new Router();
