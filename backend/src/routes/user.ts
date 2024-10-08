import { signinSchema, signupSchema } from "@anshulkardam/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()

userRouter.post('/signup', async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const payLoad = await c.req.json();
  const { success } = signupSchema.safeParse(payLoad)
  if (!success) {
    c.status(403)
    return c.json({ message: "validation failed" })
  }
 
  try {
    const user = await prisma.user.create({
      data: {
        email: payLoad.email,
        password: payLoad.password,
        firstName: payLoad.firstName,
        lastName: payLoad.lastName,
        bio: payLoad.bio
      }
    })
    
    const token = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json(token)
  } catch (e) {
    c.status(401)
    return c.json({
      message: "ERROR WHILE SIGNING UP"
    })
  }


})
userRouter.post('/signin', async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const payLoad = await c.req.json();
  const { success } = signinSchema.safeParse(payLoad)
  if (!success) {
    return c.json({ message: "validation failed" })
  }
  const user = await prisma.user.findUnique({
    where: {
      email: payLoad.email,
      password: payLoad.password
    }
  })
  if (!user) {
    c.status(403)
    return c.json({ message: "wrong username/password" })
  }

  const token = await sign({ id: user.id }, c.env.JWT_SECRET)

  return c.json(token)
})
