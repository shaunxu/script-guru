import type { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import { randomUUID } from "crypto";
import { type PartialByProperties, type Tile } from "../typings.js";

type TileInput = PartialByProperties<Tile, "id">;

export function registerTilesResolvers(resolver: Resolver) {

    resolver.define<void, Tile[]>("get_tiles", async (context, payload) => {
        return ces.entity<Tile>("tiles").find(cb => { });
    });

    resolver.define<{ target: string }, Tile[]>("get_tiles_by_target", async (context, payload) => {
        return ces.entity<Tile>("tiles").find(cb => {
            cb.and(and => {
                and.field("target").eq(payload.target);
                and.field("enabled").eq(true);
            });
        });
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

    resolver.define<{ id: string }, void>("delete_tile", async (context, payload) => {
        await ces.entity<Tile>("tiles").delete(cb => {
            cb.field("id").eq(payload.id);
        });
    });

}