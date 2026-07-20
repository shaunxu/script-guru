import { Resolver } from "@pc-nexus/core";
import { registerConsoleResolvers } from "./console.js";
import { registerSnippetsResolvers } from "./snippets.js";

const resolver = new Resolver();

registerConsoleResolvers(resolver);
registerSnippetsResolvers(resolver);

export { resolver };
