import { Router } from 'express';
import * as TopsController from '@Controllers/tops';

const router: Router = Router();

router.post('/followers', TopsController.followers);
router.post('/followers/:limit', TopsController.followers);

export default router;
