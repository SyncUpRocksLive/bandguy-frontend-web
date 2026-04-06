export type ViewArea = 'Home' | 'SongLibrary' | 'Setlists' | 'Notes';

interface Route {
	area: ViewArea;
	params: string[];
}

// --- helpers ---

function parseHash(): Route {
	const hash = window.location.hash.replace("#", "");
	const [area, ...params] = hash.split("/");

	if (isValidView(area)) {
		return { area, params };
	}

	return { area: "Home", params: [] };
}

function toHash(route: Route) {
	return `#${route.area}${route.params.length ? "/" + route.params.join("/") : ""}`;
}

function isValidView(name: string): name is ViewArea {
	return ['Home', 'SongLibrary', 'Setlists', 'Notes'].includes(name);
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
		const hash = `#${area}${params.length ? "/" + params.join("/") : ""}`;

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
}

export const router = new Router();
