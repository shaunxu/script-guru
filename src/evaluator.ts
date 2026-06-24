import { api } from "@pc-nexus/network";
import { setTimeout } from "node:timers";
import { DisposableFail, DisposableSuccess, getQuickJS, QuickJSContext, Scope, type QuickJSHandle } from "quickjs-emscripten";

function convertToQuickJSHandle(data: unknown, scope: Scope, context: QuickJSContext, seen = new Map<unknown, QuickJSHandle>()): QuickJSHandle {
    if (data === null) return context.null;
    if (data === undefined) return context.undefined;
    if (typeof data === "number") return context.newNumber(data);
    if (typeof data === "string") return scope.manage(context.newString(data));
    if (typeof data === "boolean") return data ? context.true : context.false;
    if (typeof data === "bigint") return scope.manage(context.newBigInt(data));

    if (seen.has(data)) {
        return seen.get(data)!;
    }

    if (data instanceof Uint8Array) {
        const bufferHandle = scope.manage(context.newArrayBuffer(data.buffer));
        const Uint8ArrayCtor = scope.manage(context.getProp(context.global, "Uint8Array"));
        const result = scope.manage(context.callFunction(Uint8ArrayCtor, context.undefined, [bufferHandle]));

        const handle = scope.manage(context.unwrapResult(result));
        seen.set(data, handle);
        return handle;
    }

    if (data instanceof Date) {
        const DateCtor = scope.manage(context.getProp(context.global, "Date"));
        const dateStr = scope.manage(context.newString(data.toISOString()));
        const result = scope.manage(context.callFunction(DateCtor, context.undefined, [dateStr]));

        const handle = scope.manage(context.unwrapResult(result));
        seen.set(data, handle);
        return handle;
    }

    if (Array.isArray(data)) {
        const arrayHandle = scope.manage(context.newArray());
        seen.set(data, arrayHandle);

        data.forEach((item, index) => {
            const itemHandle = convertToQuickJSHandle(item, scope, context, seen);
            context.setProp(arrayHandle, index, itemHandle);
        });
        return arrayHandle;
    }

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

export async function evaluate(code: string, args: Record<string, unknown>): Promise<unknown> {
    const module = await getQuickJS();
    const runtime = module.newRuntime();
    const vm = runtime.newContext();

    runtime.setMemoryLimit(-1);

    try {
        const result = await Scope.withScopeAsync(async (scope) => {
            const argumentsHandler = scope.manage(vm.newObject());
            for (const key in args) {
                vm.setProp(argumentsHandler, key, convertToQuickJSHandle(args[key], scope, vm));
            }
            vm.setProp(vm.global, "args", argumentsHandler);

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

            const wrappedCode = `(async () => {
${code}
})();`;
            const evalResult = vm.evalCode(wrappedCode);
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
}
