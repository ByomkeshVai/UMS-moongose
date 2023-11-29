import { Router } from "express";
import { UserRoutes } from "../modules/user/user.router";

const router = Router()

const moduleRoutes = [
    {
    path: '/users',
    route: UserRoutes,
   },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
