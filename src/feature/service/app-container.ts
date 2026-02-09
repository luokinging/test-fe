import type { IMediaPlayerService } from "./meida-player-service/media-player-service.type";
import { MediaPlayerService } from "./meida-player-service/media-player-service";
import type { IApiRequestService } from "./api-request-service/api-request-service.type";
import { ApiRequestService } from "./api-request-service/api-request-service";
import { TransientDataService } from "./transient-data-service/transient-data-service";
import type { ITransientDataService } from "./transient-data-service/transient-data-service.type";
import type { IDialogService } from "./dialog-service/dialog-service.type";
import { DialogService } from "./dialog-service/dialog-service";

/**
 * AppContainer for global services
 * simple usage, avoid complex dependency injection
 */
export class AppContainer {
  readonly requestService: IApiRequestService;
  readonly mediaPlayerService: IMediaPlayerService;
  readonly transientDataService: ITransientDataService;
  readonly dialogService: IDialogService;
  constructor() {
    this.requestService = new ApiRequestService({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });
    this.mediaPlayerService = new MediaPlayerService()
    this.transientDataService = new TransientDataService()
    this.dialogService = new DialogService()
  }
  bootstrap() {
    this.requestService.bootstrap();
  }

  dispose() {
    this.requestService.dispose();
  }
}

const _appContainer = new AppContainer();
_appContainer.bootstrap();

export const appContainer = _appContainer;
export const apiRequestService = _appContainer.requestService;
export const mediaPlayerService = _appContainer.mediaPlayerService;
export const transientDataService = _appContainer.transientDataService;
export const dialogService = _appContainer.dialogService;
