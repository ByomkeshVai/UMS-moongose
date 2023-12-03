import mongoose from 'mongoose';
import { TStudent } from './student.interface';
import { Student } from './student.model';
import { User } from '../user/user.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {

  const queryObj = {...query}
  
  const studentSearchableFields = ['name.firstName', 'email', 'address']
  let searchTerm = ''
  if (query.searchTerm) {
    searchTerm = query?.searchTerm as string;
  }

  const searchQuery = Student.find({
    $or: studentSearchableFields.map((field) => ({
      [field]: {$regex: searchTerm, $options: 'i'}
    }))
  });

  const excludeFields = ['searchTerm', 'sort', 'limit']
  excludeFields.forEach((field) => delete queryObj[field]);

  const filterQuery = searchQuery.find(queryObj)

  let sort = '-createdAt'

  if (query.sort) {
    sort = query.sort as string;
  }
  const sortQuery = filterQuery.sort(sort)

  let limit = 1
  if (query.limit) { 
    limit = query.limit as any;
  }

  const limitQuery = await sortQuery.limit(limit)

  return limitQuery;
};

const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.aggregate([{ $match: { id } }]);
  return result;
};

const updateStudentIntoDB = async (id: string, payload : Partial<TStudent>) => { 
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudentData
  }
  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)){
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)){
      modifiedUpdatedData[`guardian.${key}`] = value;
    }
  }

  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)){
      modifiedUpdatedData[`localGuardian.${key}`] = value;
    }
  }
  const result = Student.findOneAndUpdate({ id }, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  })

  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    const deletedStudent = await Student.findOneAndUpdate({id}, {isDeleted: true} , {new: true, session});
    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
    }
        const deletedUser = await User.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    session.commitTransaction();
    session.endSession();
  } catch (error) {
     await session.abortTransaction();
    await session.endSession();
    throw new Error('Failed to delete student');
  }
};

export const StudentServices = {
  updateStudentIntoDB,
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  deleteStudentFromDB,
};
