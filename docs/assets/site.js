/* Citations progressively enhance the otherwise static pages. */
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const citation = document.getElementById(button.dataset.copy);
    const status = document.getElementById("copy-status");
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(citation.textContent);
      button.textContent = "Copied";
      status.textContent = "Citation copied to clipboard.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = "Selected — press Ctrl/Cmd+C";
      status.textContent = "Citation selected. Press Control C or Command C to copy.";
    }
  });
});
