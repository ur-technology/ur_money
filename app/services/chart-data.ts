import {Injectable, EventEmitter} from '@angular/core'
import {AngularFire} from 'angularfire2'
import {Component} from '@angular/core';
import * as _ from 'lodash';
import * as Firebase from 'firebase'
import * as moment from 'moment';
import {Auth} from '../services/auth';

@Injectable()

export class ChartData {
  public currentBalance: any;
  public percentageChange: any;
  public balanceChange: any;
  public balanceRecordArray: any;
  public loadedEmitter = new EventEmitter();
  public points: any[];
  public isLoaded: boolean = false;

  constructor(public auth: Auth, public angularFire: AngularFire) {
    this.loadChartDateWhenBalanceHistoryChanges();
  }

  // private functions

  /*
  Use to convert the WeiString to Approximate UR
  */
  convertWeiStringToApproximateUR(weiString) {
    var x = "0000000000000000000" + weiString;
    x = x.replace(/\D/g, '');
    x = x.replace(/^(\d+)(\d{18})$/, "$1.$2");
    x = x.replace(/^0+([1-9])/, "$1")
    return parseFloat(x);
  }

  /*
  Method use to create the start Time for Rannge to get the balanceRecords
  */
  createStartTime(endTime, filterPeriod) {
    let startTime = moment(endTime).add(-1, 'days');
    switch (filterPeriod) {
      case '1D':
        startTime = moment(endTime).add(-1, 'days');
        break;
      case '1W':
        startTime = moment(endTime).add(-7, 'days');
        break;
      case '1M':
        startTime = moment(endTime).add(-1, 'months');
        break;
      case '6M':
        startTime = moment(endTime).add(-6, 'months');
        break;
      case '1Y':
      default:
        startTime = moment(endTime).add(-1, 'years');
        break;
    }
    return startTime;
  }


  // Public Functions

  /*
  Get The data from firebase
  */

  loadChartDateWhenBalanceHistoryChanges() {
    var balanceRecordsRef = `/users/${this.auth.currentUserId}/wallet/balanceRecords`;
    var thisPage = this;
    thisPage.angularFire.database.object(balanceRecordsRef).subscribe((balanceRecords) => {
      thisPage.isLoaded = false;
      var sortedBalanceRecords = _.sortBy(balanceRecords.value === null ? {} : balanceRecords, 'updatedAt');
      thisPage.balanceRecordArray = [];
      _.each(sortedBalanceRecords, function (record) {
        if (_.isObject(record)) {
          thisPage.balanceRecordArray.push(record);
        }
      });
      thisPage.filterBalanceWithPeriod(thisPage, '1W');
    });
  }

  /*
  Filter the Balance with Filter Period
  */
  filterBalanceRecords(filterPeriod) {
    this.filterBalanceWithPeriod(this, filterPeriod);
  }

  //Helper Function
  /*
  Actual method with period with start and end Date
  */
  filterBalanceWithPeriod(thisPage, filterPeriod) {
    thisPage.points = [];
    let sortedBalanceRecords = thisPage.balanceRecordArray;
    let lastRecord: any = _.last(sortedBalanceRecords);
    var endTime = moment.max(moment(lastRecord ? lastRecord.updatedAt : undefined, 'x'), moment());
    var startTime = thisPage.createStartTime(endTime, filterPeriod);

    //add to points array only those balance records which is after start time
    _.each(sortedBalanceRecords, function (value: any, id: any) {
      if (startTime.isBefore(moment(value.updatedAt, 'x'))) {
        thisPage.points.push([value.updatedAt, thisPage.convertWeiStringToApproximateUR(value.amount)]);
      }
    });


    /// Create clone of the sortedBalanceRecords .... so this will not effect Points array
    let decendingSorted = _.clone(sortedBalanceRecords);
    decendingSorted = decendingSorted.reverse();

    // add starting point to chart if necessry
    if (thisPage.points.length == 0 || thisPage.points[0][0] != startTime.toDate()) {
      var priorBalanceRecord = _.find(decendingSorted, function (value: any, id: any) {
        return moment(value.updatedAt, 'x').isBefore(startTime);
      });
      var startAmount = priorBalanceRecord ? thisPage.convertWeiStringToApproximateUR(priorBalanceRecord.amount) : 0.0;
      thisPage.points.unshift([startTime.valueOf(), startAmount]);
    }

    // add ending point to chart if necessry
    var lastPoint = _.last(thisPage.points);
    this.currentBalance = lastPoint[1];
    /* Comment by malkiat .... Seems not required
    // if (lastPoint[0] != endTime.toDate()) {
    //   thisPage.points.push([endTime.valueOf(), lastPoint[1]]);
    // }
    */

    // balanceChange calculation for chart
    //closne the chart Ponts so that modification in this will not effect the chart data
    let pointsData = _.clone(thisPage.points);
    // get the offset  day balance by check if the value in points data
    // before end time and after start time or equal to start time
    //// NOTE: If you want immediate value before end time just
    //uncomment return in block below
    let offsetDaybalance = _.find(pointsData, function (value: any, id: any) {
      return endTime.isAfter(value[0]) && (startTime.isBefore(value[0]) || startTime.isSame(value[0]));
      //   return endTime.isAfter(value[0]);
    });

    // If offsetDaybalance is defined then check if this greater than current balance
    /// and calculate percentageChange and balanceChange with your mathematics skills :)

    if (offsetDaybalance) {
      if (this.currentBalance > offsetDaybalance[1]) {
        this.percentageChange = ((this.currentBalance - offsetDaybalance[1]) / this.currentBalance) * 100;
        this.balanceChange = this.currentBalance - offsetDaybalance[1];
      } else {
        this.percentageChange = (((this.currentBalance - offsetDaybalance[1]) / offsetDaybalance[1]) * 100);
        this.balanceChange = this.currentBalance - offsetDaybalance[1];
      }
    } else {
      this.percentageChange = 0;
      this.balanceChange = 0;
    }
    // console.log("data loaded", thisPage.points);
    thisPage.isLoaded = true;
    thisPage.loadedEmitter.emit({});
  }

}
