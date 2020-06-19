import { Router } from 'express';
import * as UserController from '@Controllers/users';

const router: Router = Router();

router.post('/captcha', UserController.generateCaptcha);
router.post('/signup', UserController.signUp);
router.post('/auth', UserController.getAuthInfo);
router.post('/signin', UserController.signIn);
router.post('/search', UserController.search);
router.post('/info/:username', UserController.profile);
router.delete('/signout', UserController.signOut);

export default router;
