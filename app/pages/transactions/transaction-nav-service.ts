import {Injectable, EventEmitter} from '@angular/core'

@Injectable()

export class TransactionNavService {
    goToPageEmitter = new EventEmitter();
    constructor() {
    }

    goToPage(page) {
        this.goToPageEmitter.emit(page);
    }
}