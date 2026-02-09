import { createStore } from "zustand";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import * as lodash from 'lodash';

export type ApiQueryState<T = unknown> = {
    data: T | null;
    isLoading: boolean;
    isFetching: boolean;
    isDataPending: boolean;
    isError: boolean;
};

const initialState: ApiQueryState = {
    data: null,
    isLoading: false,
    isFetching: false,
    isDataPending: true,
    isError: false,
}
export class ApiQueryManager<F extends (...args: any[]) => Promise<unknown>> {

    readonly store = createStore(immer(combine(initialState as ApiQueryState<Awaited<ReturnType<F>>>, () => ({}))))

    private lastArgs: Parameters<F> | null = null;

    constructor(private readonly queryFn: F, private readonly debounce = true) { }

    get state() {
        return this.store.getState();
    }

    setState(updater: (state: ApiQueryState<unknown>) => void) {
        this.store.setState(updater);
    }

    async apiFetch(args: Parameters<F>) {
        this.lastArgs = args;
        try {
            this.setState((state) => {
                state.isLoading = true;
                state.isFetching = true;
            });
            const result = await this.queryFn(...args);
            this.setState((state) => {
                state.data = result;
                state.isDataPending = false;
            });
            this.setState((state) => {
                state.isDataPending = false;
            });
        } catch (error) {
            this.setState((state) => {
                state.isError = true;
            });
            throw error;
        } finally {
            this.setState((state) => {
                state.isLoading = false;
                state.isFetching = false;
            });
        }
    }

    private debouncedApiFetch = lodash.debounce(this.apiFetch.bind(this), 500);

    async fetch(args: Parameters<F>) {
        if (this.debounce) {
            await this.debouncedApiFetch(args);
        } else {
            await this.apiFetch(args);
        }
    }

    async apiRefetch() {
        if (!this.lastArgs) {
            return;
        }
        try {
            this.setState((state) => {
                state.isFetching = true;
            });
            const result = await this.queryFn(...this.lastArgs);
            this.setState((state) => {
                state.data = result;
            });
        } catch (error) {
            this.setState((state) => {
                state.isError = true;
            });
            throw error;
        } finally {
            this.setState((state) => {
                state.isFetching = false;
            });
        }
    }

    private debouncedApiRefetch = lodash.debounce(this.apiRefetch.bind(this), 500);

    async refetch() {
        if (this.debounce) {
            await this.debouncedApiRefetch();
        } else {
            await this.apiRefetch();
        }
    }

}
