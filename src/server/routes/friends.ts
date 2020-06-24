import { Router } from 'express';
import * as Friends from '@Controllers/friends';

const router: Router = Router();

router.post('/follow', Friends.followUser);
router.post('/unfollow', Friends.unFollowUser);
router.post('/request', Friends.sendFriendRequest);
router.post('/accept', Friends.acceptFriendRequest);
router.delete('/decline', Friends.declineFriendRequest);
router.delete('/delete', Friends.deleteFriend);

export default router;
