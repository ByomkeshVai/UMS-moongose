import { TErrorSource, TGenericErrorResponse } from '../interface/error';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
    
    const match = err.message.match(/"([^"]*)"/)

    const extractedMessage = match && match[1]

    const errorSource: TErrorSource = [{
        path: '',
        message: `{${extractedMessage} is alrready exist`,
    }]
    const statusCode = 400;
    return {
      statusCode,
      message: 'invalid item',
      errorSource,
    }
}

export default handleDuplicateError

  