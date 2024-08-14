import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateRangeFilter',
  standalone:true,
})
export class DateRangeFilterPipe implements PipeTransform {

  transform(items: any[], startDate: string, endDate: string): any[] {
    debugger
    if (!items || !startDate || !endDate) {
      return items;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return items.filter(item => {
      const itemStartDate = new Date(item.startDate);
      const itemEndDate = new Date(item.endDate);
      return itemStartDate >= start && itemEndDate <= end;
    });
  }
}
