import Joi from 'joi';

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  FRONTEND_URL: Joi.string().required(),
}).unknown();

export const validateEnvVars = () => {
  const { error } = envVarsSchema.validate(process.env);
  if (error) {
    throw new Error(`Environment variable validation error: ${error.message}`);
  }
};
