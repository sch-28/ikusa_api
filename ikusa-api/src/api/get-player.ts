import { ResponseObject } from "../routes";
import { prisma } from "../util/db";
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
		if (player_db && player_db.is_fetched) {
			return new ResponseObject(player_db, 200);
		}

		let player_id: string | null = null;

		if (!player_db) {
			const result: PlayerJson[] | Error = await FetchQueue.fetch<PlayerJson[]>(
				`${origin}/v1/adventurer/search?query=${name}&region=${region}&searchType=familyName&page=1`
			);

			if (!result || "code" in result || result.length === 0 || !result[0].profileTarget) {
				return new ResponseObject("Player not found", 404);
			}

			player_id = result[0].profileTarget;
		} else {
			player_id = player_db.id;
		}

		const result: PlayerJson | Error = await FetchQueue.fetch<PlayerJson>(
			`${origin}/v1/adventurer?profileTarget=${encodeURIComponent(player_id)}&region=${region}`
		);

		if (!result || "code" in result) {
			return new ResponseObject("Player not found", 404);
		}

		const player: Player = {
			family_name: result.familyName,
			id: result.profileTarget,
			region: result.region,
			characters: result.characters.map((character) => ({
				name: character.name,
				class: character.class,
				main: character.main,
				level: character.level ?? null,
			})),
			guild: result.guild?.name ?? null,
		};

		prisma.player
			.upsert({
				create: {
					family_name: player.family_name,
					id: player.id,
					region: player.region,
					guild: player.guild,
					is_fetched: true,
					characters: {
						createMany: {
							data: player.characters,
							skipDuplicates: true,
						},
					},
				},
				where: {
					id: player.id,
				},
				update: {
					guild: player.guild,
					is_fetched: true,
					characters: {
						createMany: {
							data: player.characters,
							skipDuplicates: true,
						},
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
