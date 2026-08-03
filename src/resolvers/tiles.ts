import type { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import { randomUUID } from "crypto";
import { type PartialByProperties, type Tile } from "../typings.js";

type TileInput = PartialByProperties<Tile, "id">;

export function registerTilesResolvers(resolver: Resolver) {

    resolver.define<void, Tile[]>("get_tiles", async (context, payload) => {
        return ces.entity<Tile>("tiles").find(cb => { });
    });

    resolver.define<{ id: string }, Tile>("get_tile", async (context, payload) => {
        const tiles = await ces.entity<Tile>("tiles").find(cb => cb.field("id").eq(payload.id));
        return tiles[0] as Tile;
    });

    resolver.define<TileInput, Tile>("save_tile", async (context, payload) => {
        if (payload.id && payload.id.length > 0) {
            await ces.entity<Tile>("tiles").update(cb => {
                cb.field("id").eq(payload.id!);
            }, payload);
            return payload as Tile;
        }
        else {
            return ces.entity<Tile>("tiles").insert({
                ...payload,
                id: randomUUID(),
            });
        }
    });

}