import type { IMediaPlayerService, Playable } from "./media-player-service.type";

export class MediaPlayerService implements IMediaPlayerService {
    private _currentPlayer: Playable | null = null;
    private _onPause: (() => void) | null = null;
  
    play(player?: Playable | null, onPause?: () => void) {
      if (player && player !== this._currentPlayer) {
        try {
          this.pause();
        } catch {
          // ignore pause error
        }
      }
      if (player) {
        this._currentPlayer = player;
        this._onPause = onPause || null;
      }
      return this._currentPlayer?.play();
    }
  
    pause() {
      this._currentPlayer?.pause();
      this._onPause?.();
    }
  }
  