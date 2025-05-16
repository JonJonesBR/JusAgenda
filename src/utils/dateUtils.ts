import moment from 'moment';

export const formatDate = (date: string | Date, formatString: string = 'YYYY-MM-DD'): string => {
  return moment(date).format(formatString);
};

// For displaying date and time together, e.g., "DD/MM/YYYY HH:mm"
export const formatDateTime = (date: string | Date): string => {
  return moment(date).format('DD/MM/YYYY HH:mm');
};

// For displaying a fuller date, e.g., "DD de MMMM de YYYY"
export const formatFullDate = (date: string | Date): string => {
  return moment(date).locale('pt-br').format('DD [de] MMMM [de] YYYY'); // Added locale for month name
};

export const formatTime = (time: string | Date): string => { // Allow Date object as well
  return moment(time, 'HH:mm').format('HH:mm');
};

export const isValidDate = (date: string): boolean => {
  return moment(date, 'YYYY-MM-DD', true).isValid();
};

export const isValidTime = (time: string): boolean => {
  return moment(time, 'HH:mm', true).isValid();
};

export const getCurrentMonth = (): string => {
  return moment().format('YYYY-MM');
};

export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  let currentDate = moment(startDate);
  const lastDate = moment(endDate);

  while (currentDate <= lastDate) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.clone().add(1, 'day');
  }

  return dates;
};
