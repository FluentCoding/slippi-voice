export interface IPCApi {
    'audio_pos': ({x, y}: {x: number, y: number}) => void;
    'connection_status': (status: number) => void;
}