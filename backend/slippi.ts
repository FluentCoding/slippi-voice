import { FrameEntryType, GameEndType, GameStartType, SlpLiveStream } from "@vinceau/slp-realtime";
import find from 'find-process';
import { setIntervalAsync } from "set-interval-async";
import { CatchAllEventEmitter } from './util/catch_all_event_emitter.js';

interface CurrentGame {
    youPort: number;
    otherPort: number;
}

export interface SlippiEvents {
    'audio_pos': ({x, y}: {x: number, y: number}) => void;
    'connection_status': (status: number) => void;
}

export class SlippiEventEmitter extends CatchAllEventEmitter<SlippiEvents> {
    private liveStream: SlpLiveStream;
    private currentGame?: CurrentGame;

    constructor() {
        super();

        this.liveStream = new SlpLiveStream("dolphin", {
            outputFiles: false
        });
        this.connect();
        this.liveStream.connection.on("statusChange", (status: number) => {
            if (status === 0) {
                console.log("Disconnected from the relay.");
                // safe reconnect (we allow enet to clean up for 1 sec, most efficient solution despite being a bit janky)
                setTimeout(this.connect.bind(this), 1000);
            } else {
                this.emit("connection_status", status);
            }
        });
        this.liveStream.connection.on("error", console.log)
        this.liveStream.gameStart$.subscribe(this.onGameStart.bind(this));
        this.liveStream.gameEnd$.subscribe(this.onGameEnd.bind(this));
        this.liveStream.playerFrame$.subscribe(this.onFrame.bind(this));

        // Find process routine in case dolphin gets closed and the livestream isn't being closed properly so it keeps showing "Connected"
        setIntervalAsync(async () => {
            // Isn't "connected"?
            if (this.liveStream.connection.getStatus() !== 2) return;

            // Check if process is still running (on my system, takes ~500-600ms per call)
            const process = await find("name", "Slippi Dolphin.exe", true);

            // Slippi isn't running? (check status again in case it disconnected during the time we searched for the process)
            if (process.length === 0 && this.liveStream.connection.getStatus() === 2) {
                this.liveStream.connection.disconnect();
            }
        }, 2000);
    }

    private connect() {
        this.liveStream.start("127.0.0.1", 51441)   
            .then(() => {
                console.log("Connected!");
            })
            .catch((err: Error) => {
                if (err.message.startsWith("Timed out")) {
                    console.log("Timed out. Reconnecting...");
                } else {
                    console.log(err);
                }
            });
    }

    private onGameStart(gameStart: GameStartType) {
        console.log("Game started!");
        this.isDirectOrUnranked(gameStart);
        this.currentGame = {
            // WIP, will be changed later
            youPort: 0,
            otherPort: 1
            /*youPort: gameStart.players.find((p) => p.connectCode === "FLCD#507")?.playerIndex!,
            otherPort: gameStart.players.find((p) => p.connectCode !== "FLCD#507")?.playerIndex!*/
        };
    }

    private onGameEnd(gameEnd: GameEndType) {
        this.currentGame = undefined;
        console.log("Game ended!");
    }

    private onFrame(frame: FrameEntryType) {
        if (!this.currentGame) return;
        const you = frame.players[this.currentGame.youPort]!;
        const other = frame.players[this.currentGame.otherPort]!;
        
        const youPosition = [you.post.positionX!, you.post.positionY!];
        const otherPosition = [other.post.positionX!, other.post.positionY!];
        
        // calculate positional difference from other player to you
        const delta = youPosition.map((v, i) => otherPosition[i] - v);
        
        this.emit("audio_pos", {
            x: delta[0],
            y: delta[1]
        });
    }

    // Check if the game is played on unranked or direct
    private isDirectOrUnranked(gameStart: GameStartType): boolean {
        // matches if there are exactly two players with a connect code (not offline melee)
        return gameStart.players.filter((p) => p.connectCode).length === 2;
    }
}