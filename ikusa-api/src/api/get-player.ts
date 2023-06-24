import { ResponseObject } from "../routes";
import { prisma, supabase } from "../util/db";
import { FetchQueue, type Error, origin } from "../util/fetch-queue";
import Logger from "../util/logger";

export type PlayerJson = {
	familyName: string;
	profileTarget: string;
	region: "EU" | "NA" | "SA";
	guild?: {
		name: string;
	};
	characters: {
		name: string;
		class: string;
		main?: boolean;
		level?: number;
	}[];
};

type Player = {
	family_name: string;
	id: string;
	region: "EU" | "NA" | "SA";
	characters: {
		name: string;
		class: string;
		main?: boolean;
		level: number | null;
	}[];
	guild: string | null;
};

export async function get_player(name: string, region: "EU" | "NA" | "SA") {
	try {
		let player_db = await prisma.player.findFirst({
			where: {
				family_name: name,
				region: region,
			},
			include: {
				characters: true,
			},
		});
		if (player_db) {
			return new ResponseObject(player_db, 200);
		}

		const result: PlayerJson[] | Error = await FetchQueue.fetch<PlayerJson[]>(
			`${origin}/v1/adventurer/search?query=${name}&region=${region}&searchType=familyName&page=1`
		);

		if (!result || "code" in result || result.length === 0) {
			return new ResponseObject("Player not found", 404);
		}

		const player: Player = {
			family_name: result[0].familyName,
			id: result[0].profileTarget,
			region: result[0].region,
			characters: result[0].characters.map((character) => ({
				name: character.name,
				class: character.class,
				main: character.main,
				level: character.level ?? null,
			})),
			guild: result[0].guild?.name ?? null,
		};
		// main character is the character with the highest level, if there are multiple characters with the same level, the one with the main tag is chosen
		/* const main_character = player.characters.reduce((prev, current) => {
			if (current.level && prev.level && current.level > prev.level) {
				return current;
			} else if (current.level === prev.level) {
				if (current.main) {
					return current;
				}
			}
			return prev;
		}, player.characters[0]); */

		prisma.player
			.create({
				data: {
					family_name: player.family_name,
					id: player.id,
					region: player.region,
					guild: player.guild,
					characters: {
						create: player.characters,
					},
				},
			})
			.catch((e) => {
				Logger.error(e);
			});

		return new ResponseObject(player, 200);
	} catch (e) {
		Logger.error("Error fetching player", e);
		return new ResponseObject("Error fetching player", 500);
	}
}
