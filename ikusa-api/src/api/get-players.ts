import { ResponseObject } from "../routes";
import Logger from "../util/logger";

type Player = {
	familyName: string;
	profileTarget: string;
	region: "EU" | "NA" | "SA";
	guild: {
		name: string;
	};
	characters: {
		name: string;
		class: string;
		main: boolean;
		level: number;
	}[];
};

export async function get_player(name: string, region: "EU" | "NA" | "SA") {
	try {
		const result: Player = await (
			await fetch(
				`http://bdo-api:8001/v1/adventurer/search?query=${name}&region=${region}&searchType=familyName&page=1`
			)
		).json();
		return new ResponseObject(result, 200);
	} catch (e) {
		Logger.error("Error fetching player", e);
		return new ResponseObject("Error fetching player", 500);
	}
}
