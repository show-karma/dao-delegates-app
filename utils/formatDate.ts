import moment from 'moment';

type IFormat =
  | 'MMM YYYY'
  | 'MMMM D, YYYY'
  | 'MMM D, YYYY'
  | 'MMM D, YYYY HH:mm';

export const formatDate = (
  dateToFormat: string,
  format: IFormat = 'MMM YYYY'
) => moment(dateToFormat).utc().format(format);
