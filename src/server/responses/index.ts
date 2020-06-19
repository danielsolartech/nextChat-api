import { Response } from 'express';

export const sendError = (controller: string, route: string, res: Response, error: any): void => {
  let message: string = '';
  if (!(error instanceof Error) && typeof error === 'string') {
    message = error;
  } else {
    console.log(controller + ' Controllers: ' + route + ':', error);
    message = 'An error was ocurred.';
  }

  res.status(400).jsonp({
    status: false,
    message,
  });

  return;
};