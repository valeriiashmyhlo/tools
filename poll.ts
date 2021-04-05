type Data = { ok: boolean };

const sleep = (delay: number) =>
    new Promise((resolve, reject) => setTimeout(resolve, delay));

const poll = async <T>(
    f: () => Promise<T>,
    delay: number,
    maxCall: number,
    checkF: (r: T) => Promise<boolean>
): Promise<T> => {
    if (maxCall === 0) {
        throw new Error('max number of calls reached');
    }

    const response = await f();
    if (await checkF(response)) {
        return response;
    }

    await sleep(delay);
    return poll(f, delay, maxCall - 1, checkF);
};

const call = (): (() => Promise<Data>) => {
    let isFirstCall = true;

    return async () => {
        await sleep(200);
        if (isFirstCall) {
            isFirstCall = false;
            return { ok: false };
        } else {
            return { ok: true };
        }
    };
};

const f = call();
const checkF = async (r: Data): Promise<boolean> => r.ok;

poll(f, 2000, 1, checkF);

export { sleep, poll };
