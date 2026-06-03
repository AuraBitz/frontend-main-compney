/** Backend login body — email or username (one required) + password */
export interface BackendLoginPayload {
  email?: string;
  username?: string;
  password: string;
}

/** Use email field when value looks like email; otherwise username */
export function buildLoginPayload(
  usernameOrEmail: string,
  password: string
): BackendLoginPayload {
  const identifier = usernameOrEmail.trim();

  if (identifier.includes("@")) {
    return { email: identifier, password };
  }

  return { username: identifier, password };
}
