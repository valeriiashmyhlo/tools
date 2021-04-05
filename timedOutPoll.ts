const wait = (delay: number): Promise<() => void> =>
    new Promise((resolve) => setTimeout(resolve, delay));

const race = <T>(promiseArr: Promise<T>[]): Promise<T> => {
    return new Promise((resolve, reject) => {
        let isFulfilled = false;

        promiseArr.forEach((promise) => {
            promise.then(
                (res) => {
                    if (isFulfilled) return;

                    resolve(res);
                    isFulfilled = true;
                },
                (err) => {
                    if (isFulfilled) return;

                    reject(err);
                    isFulfilled = true;
                }
            );
        });
    });
};

export const timedOutPoll = <T>(promise: Promise<T>, delay: number) => {
    return race([
        promise,
        wait(delay).then(() => {
            throw new Error('Timeout error');
        }),
    ]);
};

const call = async (delay: number): Promise<{ status: string }> => {
    await wait(delay);
    return { status: 'ok' };
};

timedOutPoll(call(3000), 2000).then((r) => console.log(r));
