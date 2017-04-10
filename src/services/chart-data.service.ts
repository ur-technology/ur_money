import { Injectable, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AuthService } from '../services/auth';
import Decimal from 'decimal.js';
import * as firebase from 'firebase';

@Injectable()
export class ChartDataService {
  public duration: number = 1;
  public unitOfTime: moment.UnitOfTime = 'weeks';
  public startingTime: moment.Moment;
  public endingTime: moment.Moment;
  public transactions: any[];
  public pendingTransactions: any[];
  public points: any[]; // array of points, with points represented as 2-element arrays
  public pointsLoaded: boolean = false;
  public pointsLoadedEmitter = new EventEmitter();
  public estimatedFeeWei: any;
  public estimatedFeeUR: any;
  public priorBalanceWei: any;

  constructor(public auth: AuthService) {
    this.pointsLoaded = false;

    // use fixed estimated fee for performance reasons
    this.estimatedFeeUR = new Decimal(0.1);
    this.estimatedFeeWei = this.estimatedFeeUR.times(1000000000000000000);
    this.loadPointsWhenTransactionsChange();
  }

  public dataSeries() {
    return _.map(this.points, (point) => {
      return [point[0], point[1]];
    });
  }

  private ensurePointsIncludeTimeRangeStart() {
    let firstPointTime;
    if (this.points.length > 0) {
      firstPointTime = moment(_.first(this.points)[0], 'x');
    }
    if (this.points.length === 0 || this.startingTime.isBefore(firstPointTime)) {
      let priorTransaction = _.findLast(this.transactions, (transaction: any) => {
        return moment(transaction.minedAt, 'x').isBefore(this.startingTime);
      });

      this.priorBalanceWei = new Decimal(priorTransaction ? priorTransaction.balance : 0);
      let priorBalanceUR = priorTransaction ? this.convertWeiStringToApproximateUR(priorTransaction.balance) : 0;
      this.points.unshift([this.startingTime.valueOf(), priorBalanceUR]);
    } else {
      this.priorBalanceWei = null;
    }
  }

  private ensurePointsIncludeTimeRangeEnd() {
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
    this.loadPointsCorrespondingToTransactionsWithinTimeRage();
    this.ensurePointsIncludeTimeRangeStart();
    this.ensurePointsIncludeTimeRangeEnd();
    this.pointsLoaded = true;
    this.pointsLoadedEmitter.emit({});
  }

  transactionsWithinTimeRange() {
    return _.filter(this.transactions, (transaction: any) => {
      return moment(transaction.minedAt, 'x').isSameOrAfter(this.startingTime);
    });
  }

  private loadPointsCorrespondingToTransactionsWithinTimeRage() {
    this.points = _.map(this.transactionsWithinTimeRange(), (transaction) => {
      return [transaction.minedAt, this.convertWeiStringToApproximateUR(transaction.balance)];
    });
  }

  pendingSentAmountWei(): any {
    let amount: any = new Decimal(0);
    _.each(this.pendingTransactions, (pendingTransaction) => {
      let transactionAmount: any = new Decimal(pendingTransaction.urTransaction.value);
      if (pendingTransaction.type === 'sent') {
        amount = amount.minus(transactionAmount).minus(this.estimatedFeeWei);
      }
    });
    return amount;
  }

  private calculateStartingAndEndingTimes() {
    let lastRecord: any = _.last(this.transactions);
    this.endingTime = lastRecord ? moment.max(moment(lastRecord.minedAt, 'x'), moment()) : moment();
    this.startingTime = moment(this.endingTime).add(-1 * this.duration, this.unitOfTime);
  }

  private convertWeiStringToApproximateUR(weiString) {
    var x = '0000000000000000000' + weiString;
    x = x.replace(/\D/g, '');
    x = x.replace(/^(\d+)(\d{18})$/, '$1.$2');
    x = x.replace(/^0+([1-9])/, '$1');
    return parseFloat(x);
  }

  private loadPointsWhenTransactionsChange() {
    let self = this;
    firebase.database().ref(`/users/${self.auth.currentUserId}/transactions`).orderByChild('sortKey').limitToFirst(50).on('value', (snapshot) => {
      let transactions: any[] = _.values(snapshot.val());
      self.transactions = _.sortBy(_.filter(transactions, 'sortKey'), 'sortKey');
      self.pendingTransactions = _.reject(transactions, 'sortKey');
      self.loadPointsAndCalculateMetaData(self.duration, self.unitOfTime);
    });
  }

}
