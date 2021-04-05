interface Queue<T> {
    push(value: T): Promise<void>;
    pop(): Promise<T>;
    size(): number;
}

class AsyncQueue<T> implements Queue<T> {
    private arr: T[];
    private waiting: ((value: T) => void)[];

    constructor() {
        this.arr = [];
        this.waiting = [];
    }

    async push(value: T): Promise<void> {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift()!;
            resolve(value);
        } else {
            this.arr.push(value);
        }
    }

    async pop(): Promise<T> {
        if (this.arr.length > 0) {
            return this.arr.shift()!;
        } else {
            return new Promise((resolve, reject) => {
                this.waiting.push(resolve);
            });
        }
    }

    size(): number {
        return this.arr.length;
    }
}

const sleep = (delay: number) => new Promise((res) => setTimeout(res, delay));

async function customerStream(q: Queue<string>) {
    while (true) {
        await q.push('v');
        await sleep(1000 / 2);
    }
}

async function cashRegister(q: Queue<string>, name: string) {
    while (true) {
        const t1 = new Date().getTime();
        const customer = await q.pop();
        const t2 = new Date().getTime();
        await sleep(1000);
        console.log(
            'cashier',
            name,
            'finished customer',
            customer,
            'after waiting for',
            t2 - t1,
            ',',
            q.size(),
            'customers left'
        );
    }
}

async function main() {
    const q: Queue<string> = new AsyncQueue();
    return Promise.all([
        cashRegister(q, '1'),
        cashRegister(q, '2'),
        cashRegister(q, '3'),
        customerStream(q),
        customerStream(q),
    ]);
}

main().then(() => {
    console.log('done');
});
