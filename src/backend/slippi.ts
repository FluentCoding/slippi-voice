import { TypedEmitter } from 'tiny-typed-emitter';
import { FrameEntryType, GameEndType, GameStartType, SlpLiveStream } from "@vinceau/slp-realtime";

interface CurrentGame {
    youPort: number;
    otherPort: number;
}

export class SlippiEventEmitter extends TypedEmitter<{
    'audio_pos': ({x, y}: {x: number, y: number}) => void;
}> {
    private liveStream: SlpLiveStream;
    private currentGame?: CurrentGame;

    constructor() {
        super();

        this.liveStream = new SlpLiveStream("dolphin", {
            outputFiles: false,
            suppressErrors: true
        });
        this.connect();
        this.liveStream.connection.on("statusChange", (status: number) => {
            if (status === 0) {
                console.log("Disconnected from the relay.");
                // handle auto reconnect
                this.connect();
            }
        });
        
        this.liveStream.gameStart$.subscribe(this.onGameStart.bind(this));
        this.liveStream.gameEnd$.subscribe(this.onGameEnd.bind(this));
        this.liveStream.playerFrame$.subscribe(this.onFrame.bind(this));
    }

    private connect() {
        this.liveStream.start("127.0.0.1", 51441)   
            .then(() => {
                console.log("Connected!");
            })
            .catch(() => {
                try {
                    // manually ensure that the connection is closed to trigger a reconnect
                    this.liveStream.connection.disconnect();
                } catch(e) {}
            });
    }

    private onGameStart(gameStart: GameStartType) {
        console.log("Game started!");
        this.isDirectOrUnranked(gameStart);
        this.currentGame = {
            youPort: 0,
            otherPort: 1
        };
    }

    private onGameEnd(gameEnd: GameEndType) {
        this.currentGame = undefined;
        console.log("Game ended!");
    }

    private onFrame(frame: FrameEntryType) {
        const you = frame.players[0]!;
        const other = frame.players[1]!;
        
        const youPosition = [you.post.positionX!, you.post.positionY!];
        const otherPosition = [other.post.positionX!, other.post.positionY!];
        
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