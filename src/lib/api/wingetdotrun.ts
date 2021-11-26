import type { IResponse, IResponseSingle } from "$lib/types/package";
import type { IStatsResponse } from "$lib/types/stats";

interface IOptions extends Record<string, string> {
	sort?: string;
	order?: string;
	take?: string;
	page?: string;
}

interface IPackagesOptions extends IOptions {
	query?: string;
	name?: string;
	publisher?: string;
	description?: string;
}

interface IStatsOptions extends Record<string, string> {
	packageId: string;
	resolution: string;
	before: string;
	after: string;
}

export default class Wingetdotrun {
	constructor() {}

	private _url = import.meta.env.VITE_API_URL as string;

	private _fetch = async (
		endpoint: string,
		query?: Record<string, string>,
		{ headers, ...options }: RequestInit = {}
	) => {
		const queryParams = query ? `?${new URLSearchParams(query).toString()}` : "";

		return fetch(`${this._url}${endpoint}${queryParams}`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...headers,
			},
			...options,
		}).then(async (e) => {
			if (!e.ok) {
				throw await e.json();
			}
			return e.json();
		});
	};

	packages = (options?: IPackagesOptions): Promise<IResponse> => {
		return this._fetch("/packages", options);
	};

	featured = (options?: IOptions): Promise<IResponse> => {
		return this._fetch("/featured", options);
	};

	package = (publisher: string, name: string, options?: IOptions): Promise<IResponseSingle> => {
		return this._fetch(`/packages/${publisher}/${name}`, options);
	};

	stats = (options: IStatsOptions): Promise<IStatsResponse> => {
		return this._fetch(`/stats`, options);
	};
}
