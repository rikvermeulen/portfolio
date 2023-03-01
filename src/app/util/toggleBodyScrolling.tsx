export default function toggleBodyScrolling(stopScrolling = true) {
  const bodyElement = document.querySelector('body');
  if (!bodyElement) return;
  if (stopScrolling) {
    bodyElement.classList.add('overflow-hidden');
  }
}
