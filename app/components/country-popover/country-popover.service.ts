import {Injectable, EventEmitter} from '@angular/core';


@Injectable()

export class CountryPopoverService {
    /**
     *
     */
    countrySelectedEmitter = new EventEmitter();
    constructor() {

    }

    countrySelected(country) {
        this.countrySelectedEmitter.emit(country);
    }
}