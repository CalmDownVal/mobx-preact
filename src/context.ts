import { createContext, FunctionalComponent, h } from 'preact';
import { useContext } from 'preact/hooks';

import { createContainer } from './container';

const context = createContext<Record<string, any> | null>(null);

export function createProvider() {
	const value = createContainer();
	const component: FunctionalComponent = ({ children }) => h(context.Provider, {
		children,
		value
	});

	component.displayName = 'StoreProvider';
	return component;
}

export function useStore<TStore = {}>(): TStore;
export function useStore<TStore = {}>(name: string): TStore;
export function useStore(name?: string) {
	let store = useContext(context);
	if (store === null) {
		throw new Error('Store container was not correctly provided. Did you wrap your component tree in a <StoreProvider>?');
	}
	if (name) {
		store = store[name];
		if (!store) {
			throw new Error(`The current store container does not contain the requested store '${name}'.`);
		}
	}
	return store;
}
