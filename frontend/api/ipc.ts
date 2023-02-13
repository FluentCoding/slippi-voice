import Gluon from '@gluon-framework/gluon'
import { TypedEmitter } from 'tiny-typed-emitter';
import { IPCApi } from '../../backend/ipc'

// @ts-ignore
const IPCHandler = (window.Gluon as Gluon.Window).ipc as Omit<Gluon.IPCApi, "on"> & {
    on: TypedEmitter<IPCApi>["on"]
};

export { IPCHandler };