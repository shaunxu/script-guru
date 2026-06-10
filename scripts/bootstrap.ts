import { resolver } from "../src";

const code: string = `
console.log("entering...");
await wait(500);
const a = 1 + 1;
console.log("entered", a);
return a;
`;

const result = await resolver.invoke("run", {} as any, { code: code });
console.log(result);
