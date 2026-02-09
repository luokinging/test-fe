export interface Playable {
    play(): void;
    pause(): void;
}


export interface IMediaPlayerService {
    play(player?: Playable | null, onPause?: () => void): void;
    pause(): void;
}
