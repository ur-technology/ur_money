import {Injectable, EventEmitter} from '@angular/core';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as moment from 'moment';
import * as log from 'loglevel';
import {AuthService} from '../services/auth';
import {WalletModel} from '../models/wallet';
import {BigNumber} from 'bignumber.js';

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
  public balanceUpdatedEmitter = new EventEmitter();
  public startingBalanceWei: BigNumber;
  public endingBalanceWei: BigNumber;
  public balanceChange: number;
  public percentageChange: number;
  public balanceInfo: any;
  public balanceUpdated: boolean = false;

  constructor(public auth: AuthService) {
    this.pointsLoaded = false;
    this.loadPointsWhenTransactionsChange();
  }

  public dataSeries() {
    return _.map(this.points, (point) => {
      return [point[0], point[1]];
    });
  }

  private ensureStartingTimeIncludedInPoints() {
    let firstPointTime;
    if (this.points.length > 0) {
      firstPointTime = moment(_.first(this.points)[0], 'x');
    }
    if (this.points.length === 0 || this.startingTime.isBefore(firstPointTime)) {
      let priorTransaction = _.findLast(this.transactions, (transaction: any) => {
        return moment(transaction.minedAt, 'x').isBefore(this.startingTime);
      });
      var priorBalance;
      if (priorTransaction) {
        priorBalance = this.convertWeiStringToApproximateUR(priorTransaction.balance);
        this.startingBalanceWei = new BigNumber(priorTransaction.balance);
      } else {
        priorBalance = 0;
        this.startingBalanceWei = new BigNumber(0);
      }
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
    this.balanceUpdated = false;

    this.duration = newDuration;
    this.unitOfTime = newUnitOfTime;

    this.calculateStartingAndEndingTimes();
    this.loadPointsCorrespondingToTransactionsWithinTimeRage();
    this.ensureStartingTimeIncludedInPoints();
    this.ensureEndingTimeIncludedInPoints();

    let balanceChangeWei: BigNumber = this.endingBalanceWei.minus(this.startingBalanceWei).plus(this.pendingAmountWei());
    this.balanceChange = balanceChangeWei.dividedBy(1000000000000000000).round(0, BigNumber.ROUND_HALF_FLOOR).toNumber();
    this.percentageChange = this.startingBalanceWei.isZero() ? 0 : balanceChangeWei.times(100).dividedBy(this.startingBalanceWei).round(0, BigNumber.ROUND_HALF_FLOOR).toNumber();

    this.pointsLoaded = true;
    this.pointsLoadedEmitter.emit({});

    WalletModel.availableBalanceAsync(this.auth.currentUser.wallet.address, true, this.pendingAmountWei()).then(balanceInfo => {
      this.balanceInfo = balanceInfo;
      this.balanceUpdated = true;
      this.balanceUpdatedEmitter.emit(balanceInfo);
    }, (error) => {
      log.info(`error getting balance: ${error}`);
    });
  }

  private loadPointsCorrespondingToTransactionsWithinTimeRage() {
    let transactionsWithinTimeRange = _.filter(this.transactions, (transaction: any) => {
      return moment(transaction.minedAt, 'x').isSameOrAfter(this.startingTime);
    });
    this.points = _.map(transactionsWithinTimeRange, (transaction) => {
      return [transaction.minedAt, this.convertWeiStringToApproximateUR(transaction.balance)];
    });
    if (transactionsWithinTimeRange.length > 0) {
      this.startingBalanceWei = new BigNumber(_.first(transactionsWithinTimeRange).balance);
      this.endingBalanceWei = new BigNumber(_.last(transactionsWithinTimeRange).balance);
    } else {
      this.startingBalanceWei = new BigNumber(0);
      this.endingBalanceWei = new BigNumber(0);
    }
  }

  private pendingAmountWei(): BigNumber {
    let amount: BigNumber = new BigNumber(0);
    _.each(this.pendingTransactions, (pendingTransaction) => {
      let transactionAmount: BigNumber = new BigNumber(pendingTransaction.urTransaction.value);
      if (_.includes(['received', 'earned'], pendingTransaction.type)) {
        amount = amount.plus(transactionAmount);
      } else {
        amount = amount.minus(transactionAmount).minus(WalletModel.estimatedFeeWei());
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
    firebase.database().ref(`/users/${self.auth.currentUserId}/transactions`).orderByChild('sortKey').on('value', (snapshot) => {
      let transactions: any[] = _.values(snapshot.val());
      self.transactions = _.sortBy(_.filter(transactions, 'sortKey'), 'sortKey');
      self.pendingTransactions = _.reject(transactions, 'sortKey');
      self.loadPointsAndCalculateMetaData(self.duration, self.unitOfTime);
    });
  }

}
