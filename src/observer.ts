import type { FunctionalComponent, RenderableProps, VNode } from 'preact';
import { memo } from 'preact/compat';

import { useStore } from './context';
import { isUsingStaticRendering } from './ssr';
import { useObserver } from './useObserver';
import { copyStatic } from './utils/copyStatic';

interface ObserverComponent<TStore, TProps> {
	(store: TStore, props: RenderableProps<TProps>, context?: any): VNode<any> | null;
	defaultProps?: Partial<TProps>;
	displayName?: string;
}

export function observer<TStore, TProps = {}>(baseComponent: ObserverComponent<TStore, TProps>): FunctionalComponent<TProps>;
export function observer<TStore, TProps = {}>(name: string, baseComponent: ObserverComponent<TStore, TProps>): FunctionalComponent<TProps>;
export function observer(arg0: unknown, arg1?: unknown) {
	const storeName = (arg1 ? arg0 : undefined) as string;
	const component = (arg1 ? arg1 : arg0) as ObserverComponent<unknown, unknown>;

	if (isUsingStaticRendering()) {
		return component;
	}

	const componentName = component.displayName || component.name || '<anonymous>';
	const wrappedComponent: FunctionalComponent = function (props, context) {
		const store = useStore(storeName);
		return useObserver(
			componentName,
			() => component(store, props, context));
	};

	wrappedComponent.displayName = componentName;

	const memoComponent: FunctionalComponent = memo(wrappedComponent);
	copyStatic(component, memoComponent);
	return memoComponent;
}
