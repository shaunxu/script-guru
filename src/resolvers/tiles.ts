import type { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import { type Tile } from "../typings.js";

export function registerTilesResolvers(resolver: Resolver) {

    resolver.define<{ id: string }, Tile>("get_tile", async (context, payload) => {
        const tiles = await ces.entity<Tile>("tiles").find(cb => cb.field("id").eq(payload.id));
        return tiles[0] as Tile;
    });

}