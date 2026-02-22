import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

const generateToken = (user: IUser): string => {
  const secret: Secret = process.env.JWT_SECRET as string;

  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES as SignOptions['expiresIn']
  };

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    secret,
    options
  );
};

export default generateToken;