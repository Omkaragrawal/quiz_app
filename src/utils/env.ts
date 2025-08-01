import { EnvironmentKeysEnum } from "../types/index";
// import { winstonLogger } from "../server_middleware";

const environmentVariables: Record<keyof typeof EnvironmentKeysEnum, unknown> =
  {} as Record<keyof typeof EnvironmentKeysEnum, unknown>;

const env: typeof environmentVariables =
  process.env as typeof environmentVariables;

const errors: { key: string; error: string }[] = [];

/**
NODE_ENV=development
JWT_ALGO=HS256
JWT_SECRET=abcd
 */

/** NODE_ENV */
((): void => {
  const key = EnvironmentKeysEnum.NODE_ENV;
  const values: string[] = [
    "development",
    "production",
    "test",
    "staging",
    "pipeline",
  ];

  if (env[key] === undefined || env[key] === "") {
    errors.push({
      key,
      error: "environment variable not set",
    });
  } else if (!values.includes(env[key] as string)) {
    errors.push({
      key,
      error:
        "Only specific values are allowed which entails:\n" +
        JSON.stringify(values),
    });
  }

  environmentVariables[key] = env[key] as string;
})();

/** PORT */
((): void => {
  const key = "PORT";
  const value = Number(env.PORT);

  if (env.PORT === undefined || env.PORT === "") {
    errors.push({
      key,
      error: "environment variable not set",
    });
  } else if (Number.isNaN(value) || value < 0 || value > 65535) {
    errors.push({
      key,
      error: "Please enter a valid port number",
    });
  }

  environmentVariables[key] = Number(env[key]);
})();

/** JWT_ALGO */
((): void => {
  const key = "JWT_ALGO";

  if (env[key] === undefined || env[key] === "") {
    errors.push({
      key,
      error: "environment variable not set",
    });
  } else if (env[key] !== "HS256") {
    errors.push({
      key,
      error: "Please enter the value HS256",
    });
  }

  environmentVariables[key] = env[key] as string;
})();

/** JWT_SECRET */
((): void => {
  const key = "JWT_SECRET";

  if (env[key] === undefined || env[key] === "") {
    errors.push({
      key,
      error: "environment variable not set",
    });
  } else if ((env[key] as string).length < 18) {
    errors.push({
      key,
      error: "Please enter the value of at least 16 characters for the secret",
    });
  }

  environmentVariables[key] = env[key] as string;
})();

if (errors.length) {
  errors.forEach((err) => {
    console.error({ err });
    // winstonLogger.log("crit", err);
  });
  process.exit(1);
}

export default environmentVariables;
