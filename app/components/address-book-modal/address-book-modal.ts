import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';

@Component({
    templateUrl: 'build/components/address-book-modal/address-book-modal.html'
})

/**
 * name
 */
export class AddressBookModal {
    constructor(public viewController: ViewController) {

    }

    close() {
        this.viewController.dismiss();
    }
}