/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { TErrorSource } from '../interface/error';

const globalErrorHandler : ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';


  
  let errorSource: TErrorSource = [
    {
    path: '',
    message: 'Something went wrong!'
  }
  ]

  const zodHandlerError = (err: ZodError) => { 
    const errorSource : TErrorSource = err.issues.map((issue : ZodIssue) => { 
      return {
        path: issue?.path.length - 1,
        message: issue?.message
        }
    })
    const statusCode = 400;
    return {
      statusCode,
      message: "Validation Error",
      errorSource
    }
  }

  if (err instanceof ZodError) {
    const simplifiedError = zodHandlerError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSource = simplifiedError?.errorSource;
  }

    return res.status(statusCode).json({
    success: false,
    message,
    errorSource,
  });
};

export default globalErrorHandler;
