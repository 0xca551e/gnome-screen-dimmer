import { denoPlugins } from "@luca/esbuild-deno-loader";
import { debounce } from "@std/async/debounce";
import * as esbuild from "npm:esbuild@0.20.2";

const outfile = "./gnome-screen-dimmer.js";

let process: Deno.ChildProcess | null = null;
const command = new Deno.Command("host-spawn", {
  args: [
    "gjs",
    outfile,
  ],
  stdin: "inherit",
  stdout: "inherit",
  cwd: import.meta.dirname,
});

const rebuild = debounce(async function () {
  console.info("%crebuilding...", "color:green;font-weight:bold");

  if (process) {
    process.kill();
    process = null;
  }

  const _result = await esbuild.build({
    plugins: [...denoPlugins()],
    entryPoints: ["./src/main.ts"],
    outfile,
    bundle: true,
    format: "esm",
  });

  esbuild.stop();

  process = command.spawn();

  console.info("%crebuild complete", "color:green;font-weight:bold");
}, 200);

rebuild();

const watcher = Deno.watchFs("src", { recursive: true });

for await (const _event of watcher) {
  rebuild();
}
