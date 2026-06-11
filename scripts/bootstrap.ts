import { resolver } from "../src";

const code: string = `
return {
    foo: "bar"
};
`;

const result = await resolver.invoke("run", {} as any, { code: code });
console.log(result);
