import { Pipe, PipeTransform } from '@angular/core'
import * as moment from 'moment'

@Pipe({name: 'fromNow'})
export class momentFromNowPipe implements PipeTransform {
  transform(value: string, format?: string): string {
    format = format || 'YYYY-MM-DD'
    let date = moment(value, format)
    date.hour(23)
    date.minutes(59)
    date.seconds(59)
    return date.calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: '[Yesterday]',
      lastWeek: '[Last] ddd',
      sameElse: 'MM/DD/YY'
    })
  }
}
