import { upload } from '@/config/multer';
import createBlog from '@/controllers/v1/blog/create_blog';
import deleteBlog from '@/controllers/v1/blog/delete_blog';
import getAllblogs from '@/controllers/v1/blog/get_all_blogs';
import getBlogsbySlug from '@/controllers/v1/blog/get_blog_by_slug';
import getBlogsbyUserId from '@/controllers/v1/blog/get_blogs_by_user';
import { searchBlogs } from '@/controllers/v1/blog/search_blogs';
import updateBlog from '@/controllers/v1/blog/update_blog';
import authenticateUser from '@/middlewares/authenticateUser';
import authorize from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';
import { validateData } from '@/middlewares/validator';
import { createBlogSchema } from '@/validators/blog.validator';
import { Router } from 'express';

const router: Router = Router();

router.post(
  '/',
  authenticateUser,
  authorize(['admin']),
  validateData(createBlogSchema), //TODO: Add for all
  // upload.single('banner_image'),
  // uploadBlogBanner('post'),
  createBlog,
);

router.get('/', authenticateUser, authorize(['admin', 'user']), getAllblogs);

router.get('/search', searchBlogs);

router.get(
  '/user/:userId',
  authenticateUser,
  authorize(['admin', 'user']),
  getBlogsbyUserId,
);

router.get(
  '/:slug',
  authenticateUser,
  authorize(['admin', 'user']),
  getBlogsbySlug,
);

router.put(
  '/:blogId',
  authenticateUser,
  authorize(['admin']),
  upload.single('banner_image'),
  uploadBlogBanner,
  updateBlog,
);

router.delete('/:blogId', authenticateUser, authorize(['admin']), deleteBlog);

export default router;
