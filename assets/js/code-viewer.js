// ============================================================================
// code-viewer.js — a small IntelliJ-style file tree + code pane.
// Expects a global `window.PROJECT_FILES` object (injected by the Jekyll
// layout from a generated _data/project_files/<slug>.json file) shaped like:
//
// {
//   "name": "MsgPlugin",
//   "type": "dir",
//   "children": [
//     { "name": "build.gradle.kts", "type": "file", "language": "kotlin", "content": "..." },
//     { "name": "src", "type": "dir", "children": [ ... ] }
//   ]
// }
//
// That JSON is produced automatically by tools/generate_project_tree.py —
// see the README in that folder. Nothing here is Minecraft-plugin specific;
// any project can opt in just by having a `code_data` value in its front
// matter and a matching generated JSON file.
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("code-viewer");
  if (!root || !window.PROJECT_FILES) return;

  const treeEl = root.querySelector(".cv-tree");
  const codeEl = root.querySelector(".cv-code pre");
  const headerEl = root.querySelector(".cv-code-header");

  treeEl.appendChild(buildTree(window.PROJECT_FILES, treeEl));

  function buildTree(node, container, depth = 0) {
    if (node.type === "dir") {
      const wrapper = document.createElement("div");
      const label = document.createElement("div");
      label.className = "cv-node folder";
      label.textContent = node.name;
      wrapper.appendChild(label);

      const list = document.createElement("ul");
      (node.children || [])
        .slice()
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .forEach((child) => {
          const li = document.createElement("li");
          li.appendChild(buildTree(child, list, depth + 1));
          list.appendChild(li);
        });
      wrapper.appendChild(list);

      label.addEventListener("click", () => {
        list.style.display = list.style.display === "none" ? "block" : "none";
      });

      return wrapper;
    }

    // file node
    const fileEl = document.createElement("div");
    fileEl.className = "cv-node file";
    fileEl.textContent = node.name;
    fileEl.addEventListener("click", () => {
      root.querySelectorAll(".cv-node.file.active").forEach((n) =>
        n.classList.remove("active")
      );
      fileEl.classList.add("active");
      headerEl.textContent = node.path || node.name;
      codeEl.textContent = node.content || "// (empty file)";
      codeEl.className = node.language ? `language-${node.language}` : "";
    });

    return fileEl;
  }
});
