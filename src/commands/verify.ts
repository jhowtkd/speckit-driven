import { verifyElfRun } from "../core/runtime/verifier";

export function runVerify(
  cwd: string,
  runId: string
): ReturnType<typeof verifyElfRun> {
  const result = verifyElfRun(cwd, runId);

  console.log("elf verify");
  console.log(`Run ID: ${result.runId}`);
  console.log(`Verification result: ${result.status}`);
  console.log(`Status: ${result.runStatus}`);

  return result;
}
