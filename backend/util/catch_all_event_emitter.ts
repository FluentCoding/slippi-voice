import { ListenerSignature, TypedEmitter } from "tiny-typed-emitter";

export class CatchAllEventEmitter<T extends ListenerSignature<T>> extends TypedEmitter<T> {
    private observers: ((event: keyof T, ...args: any[]) => void)[] = [];
    
    emit<U extends keyof T>(event: U, ...args: Parameters<T[U]>): boolean {
        this.observers.forEach((o) => o(event, ...args));
        return super.emit(event, ...args);
    }

    onAny<U extends keyof T>(listener: (event: U, ...args: Parameters<T[U]>) => void): this {
        this.observers.push(listener as any);
        return this;
    }

    offAny<U extends keyof T>(listener: (event: U, ...args: Parameters<T[U]>) => void): this {
        this.observers = this.observers.filter((o) => o !== listener);
        return this;
    }

    onceAny<U extends keyof T>(listener: (event: U, ...args: Parameters<T[U]>) => void): this {
        const handler = (event: any, ...args: any) => {
            listener(event, ...args);
            this.offAny(handler);
        }
        this.observers.push(handler);
        return this;
    }
}