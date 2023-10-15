import '../layout/index.html';
import '../sass/main.scss';
import Keyboard from './keyboard';
import LayoutBuilder from './page-builder';
import TextareaListener from './textarea-listener';

const keyboard = new Keyboard(localStorage.getItem('keyboardLanguage') || 'en');
const builder = new LayoutBuilder(keyboard);
let textareaListener;

function addKeyboardListeners(firstTime) {
  document.addEventListener('layoutChange', () => {
    textareaListener.addKeyHandlers(false);
  });
  textareaListener.addKeyHandlers(firstTime);
  document.addEventListener('keydown', textareaListener.bindHandlerContext(textareaListener.outputHandler));
}

function init() {
  builder.build();

  setTimeout(() => {
    textareaListener = new TextareaListener(keyboard);
    addKeyboardListeners(true);
  }, builder.BUILD_DELAY);
}

init();
