import { Router } from 'express';

import { UserRoutes } from '../modules/user/user.router';
import { StudentRoutes } from '../modules/student/student.router';
import { FacultyRoutes } from '../modules/faculty/faculty.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.router';
import { AcademicFacultyRoutes } from '../modules/academicFaculty/academicFaculty.router';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.router';
const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/faculties',
    route: FacultyRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/academic-semesters',
    route: AcademicSemesterRoutes,
  },
  {
    path: '/academic-faculties',
    route: AcademicFacultyRoutes,
  },
  {
    path: '/academic-departments',
    route: AcademicDepartmentRoutes,
  },
  // {
  //   path: '/courses',
  //   route: CourseRoutes,
  // },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
