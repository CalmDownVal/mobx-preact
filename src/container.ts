interface Ctor<T> {
	new (...args: any): T;
}

interface StoreDecoratorArgs {
	global?: true;
	name: string;
}

interface StoreDecorator {
	(storeClass: Ctor<any>): void;
}

interface StoreInfo<T> {
	readonly ctor: Ctor<T>;
	readonly global: boolean;
	readonly name: string;
	instance?: T;
}

const registry: Record<string, StoreInfo<any>> = {};

export function createContainer() {
	const container: Record<string, any> = {};
	for (const name in registry) {
		const obj = registry[name];
		container[name] = obj.instance || new obj.ctor();
		if (obj.global) {
			obj.instance = container[name];
		}
	}
	return container;
}

export function getGlobal<T>(name: string): T {
	const obj = registry[name];
	if (!obj) {
		throw new Error(`store '${name}' was not registered`);
	}
	if (!obj.global) {
		throw new Error(`store '${name}' is not registered as global`);
	}
	return obj.instance || (obj.instance = new obj.ctor());
}

export function store(args: StoreDecoratorArgs): StoreDecorator;
export function store(name: string): StoreDecorator;
export function store(arg0: StoreDecoratorArgs | string) {
	const args = typeof arg0 === 'string'
		? {
			global: false,
			name: arg0
		}
		: {
			...arg0,
			global: Boolean(arg0.global)
		};

	if (registry[args.name]) {
		throw new Error(`store '${args.name}' was already registered`);
	}

	return (ctor: Ctor<any>) => {
		registry[args.name] = {
			...args,
			ctor
		};
	};
}

store.global = (name: string) => store({ global: true, name });
