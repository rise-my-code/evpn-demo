import LABCTL from "./labctl.sh?raw";

export { LABCTL };

/** Download the rootless Podman up/down script. */
export function downloadLabctl() {
  const blob = new Blob([LABCTL], { type: "text/x-shellscript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "labctl";
  a.click();
  URL.revokeObjectURL(url);
}
