import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { RegistrationStatus } from './semesterRegistration.constant';
import { TSemsesterRegistration } from './semesterRegistration.interface';
import { SemesterRegistration } from './semesterRegistration.model';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';
import { OfferedCourse } from './../OfferedCourse/OfferedCourse.model';


const createSemesterRegistrationIntoDB = async (payload: TSemsesterRegistration) => { 
    const academicSemester = payload?.academicSemester

    const SemesterStatus = await SemesterRegistration.findOne({
        $or: [
            { status: RegistrationStatus.UPCOMING },
            { status: RegistrationStatus.ONGOING }
        ]
    })

    if (SemesterStatus) {
        throw new AppError( httpStatus.BAD_REQUEST,
      `There is aready an ${SemesterStatus.status} registered semester !`,
    )
    }
    
    const isAdademicSemesterExist = await AcademicSemester.findById(academicSemester)

    if (!isAdademicSemesterExist) {
         throw new AppError( httpStatus.NOT_FOUND,
       'This academic semester not found !',
    )
    }
    
    const isSemesterRegistrationExists = await SemesterRegistration.findOne({
        academicSemester
    })

    
  if (isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This semester is already registered!',
    );
  }

  const result = await SemesterRegistration.create(payload);
  return result;
}

const getAllSmesterRegistrationsFromDB = async (query: Record<string, unknown>) => {
     const semesterRegistrationQuery = new QueryBuilder(
    SemesterRegistration.find().populate('academicSemester'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await semesterRegistrationQuery.modelQuery;
  return result;
}

const getSingleSemesterRegistrationsFromDB = async (id: string) => {
  const result = await SemesterRegistration.findById(id);
  return result;
};

const updateSemesterRegistrationIntoDB = async (id: string, payload: Partial<TSemsesterRegistration>) =>{ 
    const isSemesterRegistrationExist = await SemesterRegistration.findById(id);

   if (!isSemesterRegistrationExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'This semester is not found !');
    }
    
    const currentSemesterStatus = isSemesterRegistrationExist?.status;
    const requiredStatus = payload?.status;

    if (currentSemesterStatus === RegistrationStatus.ENDED) { 
        throw new AppError(
      httpStatus.BAD_REQUEST,
      `This semester is already ${currentSemesterStatus}`,
    );
    }
    
    if (
        currentSemesterStatus === RegistrationStatus.ONGOING &&
        requiredStatus === RegistrationStatus.UPCOMING
    ) {
         throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not directly change status from ${currentSemesterStatus} to ${requiredStatus}`,
    );
    }
    
const result = await SemesterRegistration.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;

}

const deleteSemesterRegistrationFromDB = async (id: string) => {
    const isSemesterRegistrationExists = await SemesterRegistration.findById(id);

  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This registered semester is not found !',
    );
    }
      const semesterRegistrationStatus = isSemesterRegistrationExists.status;

  if (semesterRegistrationStatus !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update as the registered semester is ${semesterRegistrationStatus}`,
    );
    }
    
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deleteOfferedCourse = await OfferedCourse.deleteMany(
            {
                semesterRegistration: id,
            },
            session
        );

        if (!deleteOfferedCourse) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Failed to delete semester registration !',
            );
        }

        const deleteSemesterRegistration = await SemesterRegistration.findByIdAndDelete(id, {
            session,
            new: true,
        });

        if (!deleteSemesterRegistration) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Failed to delete semester registration !',
            );
        }

        await session.commitTransaction();
        await session.endSession()
        return null;
    } catch (error: any) {
        await session.abortTransaction()
        await session.endSession()
        throw new Error(error)
    }
}


export const SemesterRegistrationService = {
  createSemesterRegistrationIntoDB,
  getAllSmesterRegistrationsFromDB,
  getSingleSemesterRegistrationsFromDB,
  updateSemesterRegistrationIntoDB,
  deleteSemesterRegistrationFromDB,
};