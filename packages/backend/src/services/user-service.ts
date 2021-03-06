import Knex = require('knex')

export type UserProps = {
  username: string;
  password: string;
}

export type User = {
  username: string;
  password: string;
  id: number;
  createdAt: number;
  updatedAt: number;
}

interface UserService {
  store(user: UserProps): Promise<User>;
  update(user: UserProps): Promise<User>;
  getAll(): Promise<Array<User>>
//   delete(id: string): Promise<void>;
//   get(id: string): Promise<User>;
}

export class KnexUserService implements UserService {
  private _knex: Knex
  constructor (knex: Knex) {
    this._knex = knex
  }

  async store (user: UserProps): Promise<User> {
    try {
      const insertedUserId = await this._knex<User>('users').insert({
        username: user.username,
        password: user.password
      }).then(result => result[0])

      const insertedUser = await this._knex<User>('users').where('id', insertedUserId).first()

      if (!insertedUser) {
        throw new Error('Error inserting account into database')
      }

      return insertedUser
    } catch (error) {
      if (error.errno === 19 && error.code === 'SQLITE_CONSTRAINT') throw new Error('A user with this username already exists.')
      throw error
    }
  }

  async update (user: UserProps): Promise<User> {
    await this._knex<User>('users').where('username', user.username).update({
      password: user.password
    })
    const updatedUser = await this._knex<User>('users').where('username', user.username).first()

    if (!updatedUser) {
      throw new Error('Error updating account password in database')
    }

    return updatedUser
  }

  async getByUsername (username: string): Promise<User> {
    const user = await this._knex<User>('users').where('username', username).first()
    if (!user) {
      throw new Error('Error fetching user')
    }
    return user
  }

  async getById (id: number): Promise<User> {
    const user = await this._knex<User>('users').where('id', id).first()
    if (!user) {
      throw new Error('Error fetching user')
    }
    return user
  }

  async getAll (): Promise<Array<User>> {
    return this._knex<User>('users')
  }
}
