let activeToastTimer = null;

export function showToast(message, iconName = "check_circle") {
  let toast = document.getElementById("cm-global-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cm-global-toast";
    toast.className =
      "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full bg-inverse-surface text-inverse-on-surface shadow-xl text-xs font-medium tracking-wide pointer-events-none";
    document.body.appendChild(toast);
  }

  toast.innerHTML = "";
  const icon = document.createElement("span");
  icon.className = "material-symbols-outlined text-base text-primary-fixed";
  icon.textContent = iconName;

  const label = document.createElement("span");
  label.textContent = message;

  toast.append(icon, label);
  toast.classList.remove("hidden", "toast-enter");
  void toast.offsetWidth;
  toast.classList.add("toast-enter");

  clearTimeout(activeToastTimer);
  activeToastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
}