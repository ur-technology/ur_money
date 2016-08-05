import {Injectable, EventEmitter} from '@angular/core'
import * as _ from 'lodash';
import * as log from 'loglevel';
import * as moment from 'moment';
import {AuthService} from '../services/auth';

@Injectable()
export class ChartDataService {
  public duration: number = 1;
  public unitOfTime: moment.UnitOfTime = 'weeks';
  public startingTime: moment.Moment;
  public endingTime: moment.Moment;
  public balanceRecords: any[];
  public points: any[]; // array of points, with points represented as 2-element arrays
  public pointsLoaded: boolean = false;
  public pointsLoadedEmitter = new EventEmitter();
  public startingBalance: number;
  public endingBalance: number;
  public balanceChange: number;
  public percentageChange: number;

  constructor(public auth: AuthService) {
    this.pointsLoaded = false;
    this.loadPointsWhenBalanceRecordsChange();
  }

  private ensureStartingTimeIncludedInPoints() {
    let firstPointTime;
    if (this.points.length > 0) {
      firstPointTime = moment(_.first(this.points)[0], 'x');
    }
    if (this.points.length == 0 || this.startingTime.isBefore(firstPointTime)) {
      let priorBalanceRecord = _.findLast(this.balanceRecords, (balanceRecord: any) => {
        return moment(balanceRecord.updatedAt, 'x').isBefore(this.startingTime);
      });
      var priorBalance = priorBalanceRecord ? this.convertWeiStringToApproximateUR(priorBalanceRecord.amount) : 0.0;
      this.points.unshift([this.startingTime.valueOf(), priorBalance]);
    }
  }

  private ensureEndingTimeIncludedInPoints() {
    let lastPointTime = moment(_.last(this.points)[0], 'x');
    if (this.endingTime.isAfter(lastPointTime)) {
      let lastPointBalance = _.last(this.points)[1];
      this.points.push([this.endingTime.valueOf(), lastPointBalance]);
    }
  }

  loadPointsAndCalculateMetaData(newDuration: number, newUnitOfTime: moment.UnitOfTime) {
    this.pointsLoaded = false;

    this.duration = newDuration;
    this.unitOfTime = newUnitOfTime;

    this.calculateStartingAndEndingTimes();
    this.loadPointsCorrespondingToBalanceRecordsWithinTimeRage();
    this.ensureStartingTimeIncludedInPoints();
    this.ensureEndingTimeIncludedInPoints();

    this.startingBalance = _.first(this.points)[1];
    this.endingBalance = _.last(this.points)[1];
    this.balanceChange = this.endingBalance - this.startingBalance;
    this.percentageChange = this.startingBalance != 0 ? Math.round(this.balanceChange * 100 / this.startingBalance) : 0;

    this.pointsLoaded = true;
    this.pointsLoadedEmitter.emit({});
  }

  private loadPointsCorrespondingToBalanceRecordsWithinTimeRage() {
    let balanceRecordsWithinTimeRange = _.filter(this.balanceRecords, (balanceRecord: any) => {
      return moment(balanceRecord.updatedAt, 'x').isSameOrAfter(this.startingTime);
    });
    this.points = _.map(balanceRecordsWithinTimeRange, (balanceRecord) => {
      return [balanceRecord.updatedAt, this.convertWeiStringToApproximateUR(balanceRecord.amount)];
    });
  }

  private calculateStartingAndEndingTimes() {
    let lastRecord: any = _.last(this.balanceRecords);
    this.endingTime = lastRecord ? moment.max(moment(lastRecord.updatedAt, 'x'), moment()) : moment();
    this.startingTime = this.endingTime.add(-1 * this.duration, this.unitOfTime);
  }

  private convertWeiStringToApproximateUR(weiString) {
    var x = "0000000000000000000" + weiString;
    x = x.replace(/\D/g, '');
    x = x.replace(/^(\d+)(\d{18})$/, "$1.$2");
    x = x.replace(/^0+([1-9])/, "$1")
    return parseFloat(x);
  }

  private loadPointsWhenBalanceRecordsChange() {
    let self = this;
    firebase.database().ref(`/users/${self.auth.currentUserId}/wallet/balanceRecords`).on('value', (balanceRecordData) => {
      self.balanceRecords = _.sortBy(_.values(balanceRecordData),'updatedAt');
      self.loadPointsAndCalculateMetaData(self.duration, self.unitOfTime);
    });
  }

}
