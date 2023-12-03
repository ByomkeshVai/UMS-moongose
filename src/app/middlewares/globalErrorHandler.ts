/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { TErrorSource } from '../interface/error';
import zodHandlerError from '../error/handleZodError';
import handleValidationError from '../error/handleValidationError';
import handleCastError from '../error/handleCastError';
import handleDuplicateError from '../error/handleDuplicateError';
import AppError from '../error/AppError';

const globalErrorHandler : ErrorRequestHandler = (err, req, res, next) => {
  let statusCode =  500;
  let message = 'Something went wrong!';


  
  let errorSource: TErrorSource = [
    {
    path: '',
    message: 'Something went wrong!'
  }
  ]



  if (err instanceof ZodError) {
    const simplifiedError = zodHandlerError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSource = simplifiedError?.errorSource;
  } else if (err.name === 'validatorError') {
     const simplifiedError = handleValidationError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSource = simplifiedError?.errorSource;
  }
  else if (err.name === 'CastError') {
     const simplifiedError = handleCastError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSource = simplifiedError?.errorSource;
  }
  else if (err.code === 11000) {
     const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSource = simplifiedError?.errorSource;
  }
  else if (err instanceof AppError) {
        statusCode = err?.statusCode;
        message = err?.message;
      errorSource = [{
              path: '',
              message: err.message
        }]
  }
   else if (err instanceof Error) {
        message = err?.message;
        errorSource = [{
                path: '',
                message: err.message
          }]
  }

    return res.status(statusCode).json({
    success: false,
    message,
    errorSource,
  });
};

export default globalErrorHandler;
