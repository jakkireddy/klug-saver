import React from 'React';
import { View, StyleSheet } from 'react-native';

import { IExpense, ICategory } from '../../typings';
import Breakdown from './Components/Breakdown';
import { GrandTotal } from './Components/GrandTotal';
import { PeriodPicker } from './Components/PeriodPicker';
import moment from 'moment'
import { toddMMM, toddMMMForHumans } from '../../util';
import { CategoryFilterHeader } from './Components/CategoryFilterHeader';

export type PeriodFilterType = 'year' | 'month' | 'week' | 'day';

interface IRootProps {
  expenses: IExpense[];
}

interface IRootState {
  periodFilterType: PeriodFilterType;
  offset: number;
  filter?: ICategory;
}

export default class Root extends React.Component<IRootProps, IRootState> {
  constructor(props: IRootProps) {
    super(props);
    this.state = {
      periodFilterType: 'month',
      offset: 0,
      filter: undefined
    };
  }

  public render() {
    const expenses = this.getFilteredExpenses();
    const { periodFilterType, offset, filter } = this.state;

    return <View style={styles.breakdownContainer}>
      <PeriodPicker
        currentFilterType={periodFilterType}
        onCurrentFilterChange={this.onCurrentFilterChange}
      />
      <GrandTotal
        expenses={expenses}
        label={this.getPeriodLabel()}
        isBeforeHidden={offset < -365}
        isNextHidden={offset >= 0}
        onBefore={this.onOffsetChange(-1)}
        onNext={this.onOffsetChange(1)}
      />
      <CategoryFilterHeader filter={filter} onReset={this.onResetFilter} />
      <Breakdown
        expenses={expenses}
        filter={filter}
        onFilterChange={this.onFilterChange}
      />
    </View>
  }

  private onFilterChange = (filter: ICategory) => {
    this.setState({ filter });
  };

  private onResetFilter = () => {
    this.setState({ filter: undefined });
  }

  private onOffsetChange = (amount: number) => () => {
    this.setState({ offset: this.state.offset + amount });
  }

  private onCurrentFilterChange = (periodFilterType: PeriodFilterType) => {
    this.setState({ periodFilterType, offset: 0 });
  }

  private getFilteredExpenses = (): IExpense[] => {
    const { expenses } = this.props;
    const { periodFilterType, offset, filter } = this.state;
    const startDate = moment().add(offset, periodFilterType).startOf(periodFilterType);
    const endDate = moment().add(offset, periodFilterType).endOf(periodFilterType);

    console.log(toddMMM(startDate.valueOf()));
    console.log(toddMMM(endDate.valueOf()));

    return expenses.filter(e =>
      e.createdAt >= startDate.valueOf() &&
      e.createdAt < endDate.valueOf() &&
      (!filter || e.category === filter.title)
    );
  }

  private getPeriodLabel = () => {
    const { periodFilterType, offset } = this.state;
    const date = moment().add(offset, periodFilterType);

    if (periodFilterType === 'day') {
      return toddMMMForHumans(date.valueOf());
    } else if (periodFilterType === 'week') {
      const startDate = moment().add(offset, periodFilterType).startOf(periodFilterType);
      const endDate = moment().add(offset, periodFilterType).endOf(periodFilterType);
      return `${toddMMM(startDate.valueOf())} - ${toddMMM(endDate.valueOf())}`;
    } else if (periodFilterType === 'month') {
      return date.format('MMMM YYYY');
    } else if (periodFilterType === 'year') {
      return date.format('YYYY');
    }

    return 'Something went wrong ?!?';
  }
}

const styles = StyleSheet.create({
  breakdownContainer: {
    flex: 1
  }
});
