import { getServerConfig } from "@/config";

import { SignIn } from "./signin";

const HOSTED_AUTH_URL = new URL(
  "ui/signin",
  getServerConfig().EDGEDB_AUTH_BASE_URL
);

export default function SignInPage() {
  return (
    <SignIn authHref={HOSTED_AUTH_URL.href} />
  )
}
