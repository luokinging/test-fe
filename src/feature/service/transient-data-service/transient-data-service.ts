import type { ITransientDataService } from "./transient-data-service.type";
import { createStore } from 'zustand';
import { combine, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    // Map<messageId, data>
    dataMap: {} as Record<string, unknown | undefined>,
};
export class TransientDataService implements ITransientDataService {
    readonly store = createStore(
        persist(immer(combine(initialState, () => ({}))), {
            name: 'transient-data',
            storage: createJSONStorage(() => sessionStorage),
        })
    );

    get state() {
        return this.store.getState();
    }

    get dataMap() {
        return this.state.dataMap;
    }

    setState(updater: (state: typeof initialState) => void) {
        this.store.setState(updater);
    }

    setMessage(messageId: string, data: any) {
        this.setState((state) => {
            state.dataMap[messageId] = data;
        });
    }

    createMessage<T>(data: T) {
        const message = uuidv4();
        this.setMessage(message, data);
        return message;
    }

    getMessage<T>(messageId: string | undefined): T | undefined {
        if (!messageId) return undefined;
        const data = this.dataMap[messageId];
        return data as T | undefined;
    }

    updateMessage<T>(messageId: string, data: Partial<T>) {
        this.setState((state) => {
            const message = state.dataMap[messageId];
            if (!message) return;
            state.dataMap[messageId] = { ...message, ...data };
        });
    }

    deleteMessage(messageId: string) {
        this.setState((state) => {
            delete state.dataMap[messageId];
        });
    }

    create<T = undefined>(messageId: string, data: T): string {
        if (this.dataMap[messageId]) {
            console.error(`TransientDataService: messageId ${messageId} already exists, will be overridden`);
        }
        this.setMessage(messageId, data);
        return messageId;
    }
}
