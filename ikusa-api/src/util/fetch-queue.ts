export type Error = {
	message: string;
	code: number;
};

export class FetchQueue {
	private static queue: { url: string; resolve: (value: any) => void }[] = [];
	private static interval: NodeJS.Timeout | null = null;

	public static async fetch<T>(url: string): Promise<T | Error> {
		const req = this.queue.find((req) => req.url === url);
		if (req) {
			return new Promise((res) => {
				const old_resolve = req.resolve.bind({});
				req.resolve = (v) => {
					res(v);
					old_resolve(v);
				};
			});
		}

		let resolve: (value: T) => void = () => {};
		const promise = new Promise<T>((res) => (resolve = res));

		this.queue.push({ url, resolve: resolve });

		if (!this.interval) {
			this.interval = setInterval(async () => {
				if (this.queue.length > 0) {
					const request = this.queue.shift()!;
					const result = await fetch(request.url).catch((e) =>
						request.resolve({ message: e.message, code: 500 })
					);

					result && request.resolve(await result.json().catch((e) => ({ message: e.message, code: 500 })));
				}

				if (this.queue.length === 0 && this.interval) {
					clearInterval(this.interval);
					this.interval = null;
				}
			}, 1000);
		}

		return promise;
	}
}
