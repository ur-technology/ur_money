import {Component} from '@angular/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {LoadingService} from './loading-service';


@Component({
    selector: 'loading-modal',
    templateUrl: 'build/components/loading-modal/loading-modal.html',
    directives: [IONIC_DIRECTIVES] // makes all Ionic directives available to your component
})
export class LoadingModal {
    isBusy: boolean = false;
    constructor(public loadingService: LoadingService) {
        this.isBusy = false;

        this.loadingService.loadingShowEmitter.subscribe(() => {
            this.isBusy = true;
        });


        this.loadingService.loadingHideEmitter.subscribe(() => {
            this.isBusy = false;
        });
    }

}