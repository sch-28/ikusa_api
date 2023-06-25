import { ResponseObject } from "../routes";
import { prisma } from "../util/db";
import { Error, FetchQueue, origin } from "../util/fetch-queue";
import Logger from "../util/logger";
import { PlayerJson } from "./get-player";
import { Response } from "express";

export async function get_characters(names: string[], region: "EU" | "NA" | "SA", res: Response) {
	try {
		let players_db = await prisma.player.findMany({
			where: {
				region: region,
				characters: {
					some: {
						name: {
							in: names,
						},
					},
				},
			},
			include: {
				characters: true,
			},
		});

		const missing_players = names.filter(
			(name) => !players_db.some((player) => player.characters.some((c) => c.name === name))
		);

		/* console.log(missing_players);

		if (missing_players.length === 0) {
			return new ResponseObject(players_db, 200);
		} */
		const stream = res.writeHead(200, {
			"Content-Type": "text/plain",
			"Transfer-Encoding": "chunked",
		});

		for (let i = 0; i < players_db.length; i++) {
			const player = players_db[i];
			const char = player.characters.find((c) => names.includes(c.name));
			const p = {
				char_name: char?.name,
				name: player.family_name,
				class: char?.class,
				progress: i + 1,
				total: names.length,
			};
			res.write(JSON.stringify(p));
		}

		let progress = names.length - missing_players.length;
		const promises: Promise<PlayerJson[] | Error>[] = [];
		for (const char_name of missing_players) {
			const name_promise = FetchQueue.fetch<PlayerJson[]>(
				`${origin}/v1/adventurer/search?query=${char_name}&region=${region}&searchType=characterName&page=1`
			);
			promises.push(name_promise);
			name_promise.then((result) => {
				progress++;
				if (!result || "code" in result || result.length === 0) {
					Logger.error(`Error fetching ${char_name}`);
					if (result && "code" in result) Logger.error(result.message);
					stream.write(
						JSON.stringify({
							char_name: char_name,
							name: "",
							class: "",
							progress: progress,
							total: names.length,
						})
					);
				} else {
					const player: PlayerJson = result[0];
					prisma.player
						.upsert({
							update: {
								characters: {
									create: {
										name: player.characters[0].name,
										class: player.characters[0].class,
										main: player.characters[0].main,
										level: player.characters[0].level,
									},
								},
							},
							create: {
								family_name: player.familyName,
								id: player.profileTarget,
								region: player.region,
								guild: player.guild?.name ?? undefined,
								characters: {
									create: {
										name: player.characters[0].name,
										class: player.characters[0].class,
										main: player.characters[0].main,
										level: player.characters[0].level,
									},
								},
							},
							where: {
								id: player.profileTarget,
							},
						})
						.catch((e) => {
							Logger.error(e.message);
						});

					stream.write(
						JSON.stringify({
							char_name: char_name,
							name: result[0].familyName,
							class: result[0].characters[0].class,
							progress: progress,
							total: names.length,
						})
					);
				}
			});
		}

		const results = await Promise.all(promises);
		stream.end();
	} catch (e) {
		Logger.error("Error fetching player", e);
		return new ResponseObject("Error fetching player", 500);
	}
}
