import bcrypt from "bcryptjs";
import nanoid from "nanoid";
import uuid from "uuid/v4";
import { addMinutes } from "date-fns";

import knex, { prefix } from "../../knex";
import * as redis from "../../redis";
import { getRedisKey } from "../../utils";

export const getUser = async (emailOrKey = ""): Promise<User> => {
  const redisKey = getRedisKey.user(emailOrKey);
  const cachedUser = await redis.get(redisKey);

  if (cachedUser) return JSON.parse(cachedUser);

  const user = await knex<UserJoined>(prefix + "users")
    .select(
      prefix + "users.id",
      prefix + "users.apikey",
      prefix + "users.banned",
      prefix + "users.banned_by_id",
      prefix + "users.cooldowns",
      prefix + "users.created_at",
      prefix + "users.email",
      prefix + "users.password",
      prefix + "users.updated_at",
      prefix + "users.verified",
      prefix + "domains.id as domain_id",
      prefix + "domains.homepage as homepage",
      prefix + "domains.address as domain"
    )
    .where("email", "ILIKE", emailOrKey)
    .orWhere({ apikey: emailOrKey })
    .leftJoin(
      prefix + "domains",
      prefix + "users.id",
      prefix + "domains.user_id"
    )
    .first();

  if (user) {
    redis.set(redisKey, JSON.stringify(user), "EX", 60 * 60 * 1);
  }

  return user;
};

export const createUser = async (
  emailToCreate: string,
  password: string,
  user?: User
) => {
  const email = emailToCreate.toLowerCase();
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const data = {
    email,
    password: hashedPassword,
    verification_token: uuid(),
    verification_expires: addMinutes(new Date(), 60).toISOString()
  };

  if (user) {
    await knex<User>(prefix + "users")
      .where({ email })
      .update({ ...data, updated_at: new Date().toISOString() });
  } else {
    await knex<User>(prefix + "users").insert(data);
  }

  redis.del(getRedisKey.user(email));

  return {
    ...user,
    ...data
  };
};

export const verifyUser = async (verification_token: string) => {
  const [user]: User[] = await knex<User>(prefix + "users")
    .where({ verification_token })
    .andWhere("verification_expires", ">", new Date().toISOString())
    .update(
      {
        verified: true,
        verification_token: undefined,
        verification_expires: undefined,
        updated_at: new Date().toISOString()
      },
      "*"
    );

  if (user) {
    redis.del(getRedisKey.user(user.email));
  }

  return user;
};

export const changePassword = async (id: number, newPassword: string) => {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(newPassword, salt);

  const [user]: User[] = await knex<User>(prefix + "users")
    .where({ id })
    .update({ password, updated_at: new Date().toISOString() }, "*");

  if (user) {
    redis.del(getRedisKey.user(user.email));
    redis.del(getRedisKey.user(user.apikey));
  }

  return user;
};

export const generateApiKey = async (id: number) => {
  const apikey = nanoid(40);

  const [user]: User[] = await knex<User>(prefix + "users")
    .where({ id })
    .update({ apikey, updated_at: new Date().toISOString() }, "*");

  if (user) {
    redis.del(getRedisKey.user(user.email));
    redis.del(getRedisKey.user(user.apikey));
  }

  return user && apikey;
};

export const requestPasswordReset = async (emailToMatch: string) => {
  const email = emailToMatch.toLowerCase();
  const reset_password_token = uuid();

  const [user]: User[] = await knex<User>(prefix + "users")
    .where({ email })
    .update(
      {
        reset_password_token,
        reset_password_expires: addMinutes(new Date(), 30).toISOString(),
        updated_at: new Date().toISOString()
      },
      "*"
    );

  if (user) {
    redis.del(getRedisKey.user(user.email));
    redis.del(getRedisKey.user(user.apikey));
  }

  return user;
};

export const resetPassword = async (reset_password_token: string) => {
  const [user]: User[] = await knex<User>(prefix + "users")
    .where({ reset_password_token })
    .andWhere("reset_password_expires", ">", new Date().toISOString())
    .update(
      {
        reset_password_expires: null,
        reset_password_token: null,
        updated_at: new Date().toISOString()
      },
      "*"
    );

  if (user) {
    redis.del(getRedisKey.user(user.email));
    redis.del(getRedisKey.user(user.apikey));
  }

  return user;
};

export const addCooldown = async (id: number) => {
  const [user]: User[] = await knex(prefix + "users")
    .where({ id })
    .update(
      {
        cooldowns: knex.raw("array_append(cooldowns, ?)", [
          new Date().toISOString()
        ]),
        updated_at: new Date().toISOString()
      },
      "*"
    );

  if (user) {
    redis.del(getRedisKey.user(user.email));
    redis.del(getRedisKey.user(user.apikey));
  }

  return user;
};

export const banUser = async (id: number, banned_by_id?: number) => {
  const [user]: User[] = await knex<User>(prefix + "users")
    .where({ id })
    .update(
      { banned: true, banned_by_id, updated_at: new Date().toISOString() },
      "*"
    );

  if (user) {
    redis.del(getRedisKey.user(user.email));
    redis.del(getRedisKey.user(user.apikey));
  }

  return user;
};
