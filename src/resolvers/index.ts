import { Resolver } from "@pc-nexus/core";
import { registerAutomationsResolvers } from "./automations.js";
import { registerConsoleResolvers } from "./console.js";
import { registerSnippetsResolvers } from "./snippets.js";
import { registerTilesResolvers } from "./tiles.js";

const resolver = new Resolver();

registerConsoleResolvers(resolver);
registerSnippetsResolvers(resolver);
registerAutomationsResolvers(resolver);
registerTilesResolvers(resolver);

export { resolver };
