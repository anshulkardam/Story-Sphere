import z from 'zod';

export const createBlogSchema = z.object({
  title: z.string().max(180, 'Title must be less than 180 characters'),
  content: z.string('Content is Required'),
 // status: z.enum(['draft', 'published']),
});

export const updateBlogSchema = z.object({
  title: z.string().max(180, 'Title must be less than 180 characters'),
  content: z.string('Content is Required'),
  status: z.enum(['draft', 'published']),
});
