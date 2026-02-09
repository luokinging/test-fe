export interface ITransientDataService {
    createMessage<T>(data: T): string;
    getMessage<T>(messageId: string | undefined): T | undefined;
    updateMessage<T>(messageId: string, data: Partial<T>): void;
    deleteMessage(messageId: string): void;
    create<T = undefined>(messageId: string, data: T): string;
  }
  