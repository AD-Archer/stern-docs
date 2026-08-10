import { redirect } from "next/navigation";
import { listPrograms } from "@/lib/content";
import { DEFAULT_PROGRAM } from "@/lib/site";

/**
 * There's no site-wide index: every deploy is somebody's docs. `/` goes to the
 * configured program, falling back to whatever content exists so a fresh clone
 * with one folder in content/ works before anyone sets an env var.
 */
export default async function Root() {
  const programs = await listPrograms();
  const target = programs.includes(DEFAULT_PROGRAM)
    ? DEFAULT_PROGRAM
    : (programs[0] ?? DEFAULT_PROGRAM);
  redirect(`/${target}`);
}
