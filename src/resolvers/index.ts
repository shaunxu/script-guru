import { Resolver } from "@pc-nexus/core";
import { api } from "@pc-nexus/network";
import { setTimeout } from "node:timers";
import { DisposableFail, DisposableSuccess, getQuickJS, QuickJSContext, Scope, type QuickJSHandle } from "quickjs-emscripten";

const resolver = new Resolver();

resolver.define<string, string>("greeting", async (context, payload) => {
    return `Hello, ${payload}`;
});

function convertToQuickJSHandle(data: unknown, scope: Scope, context: QuickJSContext, seen = new Map<unknown, QuickJSHandle>()): QuickJSHandle {
    // 处理基础类型 (这些 Handle 是由 QuickJS 环境常驻的，不需要销毁)
    if (data === null) return context.null;
    if (data === undefined) return context.undefined;
    if (typeof data === "number") return context.newNumber(data);
    if (typeof data === "string") return scope.manage(context.newString(data));
    if (typeof data === "boolean") return data ? context.true : context.false;
    if (typeof data === "bigint") return scope.manage(context.newBigInt(data));

    // 处理循环引用
    if (seen.has(data)) {
        return seen.get(data)!;
    }

    // 处理 Uint8Array (二进制数据)
    if (data instanceof Uint8Array) {
        const bufferHandle = scope.manage(context.newArrayBuffer(data.buffer));
        const Uint8ArrayCtor = scope.manage(context.getProp(context.global, "Uint8Array"));
        const result = scope.manage(context.callFunction(Uint8ArrayCtor, context.undefined, [bufferHandle]));

        const handle = scope.manage(context.unwrapResult(result));
        seen.set(data, handle);
        return handle;
    }

    // 处理 Date
    if (data instanceof Date) {
        const DateCtor = scope.manage(context.getProp(context.global, "Date"));
        const dateStr = scope.manage(context.newString(data.toISOString()));
        const result = scope.manage(context.callFunction(DateCtor, context.undefined, [dateStr]));

        const handle = scope.manage(context.unwrapResult(result));
        seen.set(data, handle);
        return handle;
    }

    // 处理数组
    if (Array.isArray(data)) {
        const arrayHandle = scope.manage(context.newArray());
        seen.set(data, arrayHandle);

        data.forEach((item, index) => {
            const itemHandle = convertToQuickJSHandle(item, scope, context, seen);
            context.setProp(arrayHandle, index, itemHandle);
        });
        return arrayHandle;
    }

    // 处理普通对象
    if (typeof data === "object" && data !== null) {
        const objHandle = scope.manage(context.newObject());
        seen.set(data, objHandle);

        for (const [key, value] of Object.entries(data)) {
            if (typeof value !== 'function') {
                const valueHandle = convertToQuickJSHandle(value, scope, context, seen);
                context.setProp(objHandle, key, valueHandle);
            }
        }
        return objHandle;
    }

    return context.undefined;
}

resolver.define<{ code: string }, unknown>("run", async (context, payload) => {
    const module = await getQuickJS();
    const runtime = module.newRuntime();
    const vm = runtime.newContext();

    runtime.setMemoryLimit(-1);

    try {
        const result = await Scope.withScopeAsync(async (scope) => {
            const consoleHandler = scope.manage(vm.newObject());
            const logHandler = scope.manage(vm.newFunction("log", (...args) => {
                console.log("[Script Guru]", ...args.map(vm.dump));
            }));
            vm.setProp(consoleHandler, "log", logHandler);
            vm.setProp(vm.global, "console", consoleHandler);

            const waitHandler = scope.manage(vm.newFunction("wait", (timeout) => {
                const promise = scope.manage(vm.newPromise());
                setTimeout(() => promise.resolve(), scope.manage(vm.dump(timeout)));
                promise.settled.then(() => runtime.executePendingJobs());
                return promise.handle;
            }));
            vm.setProp(vm.global, "wait", waitHandler);

            const requestApiHandler = scope.manage(vm.newFunction("requestApi", (routeHandler, methodHandler, bodyHandler) => {
                const route: string = scope.manage(vm.dump(routeHandler));
                const method: string = scope.manage(vm.dump(methodHandler));
                const body: string | undefined = bodyHandler && JSON.stringify(scope.manage(vm.dump(bodyHandler)));

                const promise = scope.manage(vm.newPromise());
                api.request(route, {
                    method: method,
                    headers: {
                        "context-type": "application/json"
                    },
                    body: body,
                    as: "app"
                }).then(x => {
                    if (x.ok) {
                        return x.json();
                    }
                    return promise.reject(convertToQuickJSHandle({
                        statusCode: x.status,
                        statusText: x.statusText
                    }, scope, vm));
                }).then(x => {
                    return promise.resolve(convertToQuickJSHandle(x, scope, vm));
                }).catch(err => {
                    return promise.reject(err);
                });
                promise.settled.then(() => runtime.executePendingJobs());
                return promise.handle;
            }));
            vm.setProp(vm.global, "requestApi", requestApiHandler);

            const code = `(async () => {
${payload.code}
})();`;
            const evalResult = vm.evalCode(code);
            if (evalResult.error) {
                throw new Error(`Eval Error: ${JSON.stringify(vm.dump(evalResult.error))}`);
            }

            const promiseHandler = scope.manage(vm.unwrapResult(evalResult));
            const promise = vm.resolvePromise(promiseHandler);
            runtime.executePendingJobs();

            const promiseResultHandler = await promise;
            if (promiseResultHandler instanceof DisposableSuccess) {
                const promiseResult = scope.manage(promiseResultHandler.unwrap());
                const result = scope.manage(vm.dump(promiseResult));
                return result;
            }
            else if (promiseResultHandler instanceof DisposableFail) {
                throw new Error(`Promise Error: ${JSON.stringify(vm.dump(promiseResultHandler.error))}`);
            }
            else {
                throw new Error(`Unknown Error: ${JSON.stringify(vm.dump(promiseResultHandler))}`);
            }
        });

        return result;
    }
    finally {
        vm.dispose();
        runtime.dispose();
    }
});

export { resolver };
