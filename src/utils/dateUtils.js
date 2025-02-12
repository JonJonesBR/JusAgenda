import { moment } from './common';

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

export const formatDateTime = (date) => {
  return moment(date).format('DD/MM/YYYY HH:mm');
};

export const formatFullDate = (date) => {
  return moment(date).format('dddd, DD [de] MMMM [de] YYYY');
};

export const formatTime = (date) => {
  return moment(date).format('HH:mm');
};

export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

export const isFutureDate = (date) => {
  return moment(date).isAfter(moment());
};

export default moment; 