import {Injectable, EventEmitter} from '@angular/core'
import {AngularFire} from 'angularfire2'
import {Component} from '@angular/core';
import * as _ from 'underscore'
import * as Firebase from 'firebase'
import * as moment from 'moment';
import {Auth} from '../../components/auth/auth';

@Injectable()

export class ChartData {
  public currentBalance: any;
  public loadedEmitter = new EventEmitter();
  public points: any[];
  public isLoaded: boolean = false;

  constructor(public auth: Auth, public angularFire: AngularFire) {
    this.loadChartDateWhenBalanceHistoryChanges();
  }

  convertWeiStringToApproximateUR(weiString) {
     var x = "0000000000000000000" + weiString;
     x = x.replace(/\D/,'');
     x = x.replace(/^(\d+)(\d{18})$/, "$1.$2");
     x = x.replace(/^0+([1-9])/,"$1")
     return parseFloat(x);
   }

  loadChartDateWhenBalanceHistoryChanges() {
    var balanceHistoryRef = this.auth.userRef.child("wallet").child("balanceHistory");
    var thisPage = this;
    thisPage.angularFire.database.object(balanceHistoryRef).subscribe((balanceHistory) => {
      thisPage.isLoaded = false;
      thisPage.points = [];
      var sortedBalanceHistory = _.sortBy(balanceHistory, 'updatedAt');
      let lastRecord: any = _.last(sortedBalanceHistory);
      var endTime = moment.max(moment(lastRecord ? lastRecord.updatedAt : undefined, 'x'),moment());
      var startTime = moment(endTime).add(-7, 'days');

      _.each(sortedBalanceHistory, function(value: any, id: any) {
        if (startTime.isBefore(moment(value.updatedAt, 'x'))) {
          thisPage.points.push([value.updatedAt, thisPage.convertWeiStringToApproximateUR(value.amount)]);
        }
      });

      // add starting point to chart if necessry
      if (thisPage.points.length == 0 || thisPage.points[0][0] != startTime.toDate()) {
        var priorBalanceRecord = _.detect(sortedBalanceHistory.reverse(), function(value: any, id: any) {
          return moment(value.updatedAt, 'x').isBefore(startTime);
        });
        var startAmount = priorBalanceRecord ? thisPage.convertWeiStringToApproximateUR(priorBalanceRecord.amount) : 0.0;
        thisPage.points.unshift([startTime.valueOf(), startAmount]);
      }

      // add ending point to chart if necessry
      var lastPoint = _.last(thisPage.points);
      if (lastPoint[0] != endTime.toDate()) {
        thisPage.points.push([endTime.valueOf(), lastPoint[1]]);
      }
      this.currentBalance = lastPoint[1];

      console.log("data loaded", thisPage.points);
      thisPage.isLoaded = true;
      thisPage.loadedEmitter.emit({});
    }) ;

  }

}
