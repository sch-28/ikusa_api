import { FetchQueue } from "../util/fetch-queue";

test("fetch-queue", async () => {
	const origin = process.env.NODE_ENV === "production" ? "http://bdo-api:8001" : "http://localhost:8001";
	const url_oracle = `${origin}/v1/adventurer/search?query=OracIe&region=EU&searchType=familyName&page=1`;
	const url_Basmann = `${origin}/v1/adventurer/search?query=Basmann&region=EU&searchType=familyName&page=1`;
	const url_Bob = `${origin}/v1/adventurer/search?query=Bob&region=EU&searchType=familyName&page=1`;

	const oracle = FetchQueue.fetch(url_oracle);
	const oracle_2 = FetchQueue.fetch(url_oracle);
	const basmann = FetchQueue.fetch(url_Basmann);
	const bob = FetchQueue.fetch(url_Bob);

	await Promise.all([oracle, oracle_2, basmann, bob]).then((values) => {
		expect(values[0]).toBe(values[1]);
		expect(values[0]).not.toEqual(values[2]);
		expect(values[0]).not.toEqual(values[3]);
		expect(values[2]).not.toEqual(values[3]);
	});
});
