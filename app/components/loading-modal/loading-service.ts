import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class LoadingService {
    public loadingShowEmitter = new EventEmitter();
    public loadingHideEmitter = new EventEmitter();

    constructor() {

    }

    show() {
        this.loadingShowEmitter.emit({});
    }

    hide() {
        this.loadingHideEmitter.emit({});
    }

}

