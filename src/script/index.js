import '../layout/index.html';
import '../sass/main.scss';
import Keyboard from './keyboard';
import LayoutBuilder from './page-builder';

const keyboard = new Keyboard(localStorage.getItem('keyboardLanguage') || 'en');
const builder = new LayoutBuilder(keyboard);

const { fontSize } = getComputedStyle(document.body);
const REM_CHAR_SIZE = (19787 / 40000) * Number(fontSize.substring(0, fontSize.length - 2))
+ 81 / 1000;
const calculateLineWidth = (textArea) => Math.ceil(textArea.offsetWidth / REM_CHAR_SIZE) - 20;

function getTextAreaData() {
  const textArea = document.querySelector('textarea');
  textArea.focus();
  const textValue = textArea.value;
  const cursorStart = textArea.selectionStart;
  const cursorEnd = textArea.selectionEnd;
  return {
    textArea, textValue, cursorStart, cursorEnd,
  };
}

const outputHandler = {
  handleEvent(event) {
    event.preventDefault();
    const { textArea, textValue, cursorStart } = getTextAreaData();
    textArea.value = textValue.substring(0, cursorStart) + keyboard.lastOutput
      + textValue.substring(cursorStart);
    if (keyboard.lastOutput.length > 0) {
      textArea.selectionStart = cursorStart + keyboard.lastOutput.length;
      textArea.selectionEnd = cursorStart + keyboard.lastOutput.length;
    }
  },
};

function addLayoutListeners(firstTime) {
  keyboard.addOnClickListener(outputHandler);
  keyboard.addKeyHandler({
    handler: {
      handleEvent() {
        const { textArea } = getTextAreaData();
        textArea.selectionStart += 1;
      },
    },
    keycode: 'ArrowRight',
    click: true,
    key: firstTime,
  });

  keyboard.addKeyHandler({
    handler: {
      handleEvent() {
        const { textArea, cursorStart } = getTextAreaData();
        textArea.selectionStart = Math.max(0, cursorStart - 1);
        textArea.selectionEnd = textArea.selectionStart;
      },
    },
    keycode: 'ArrowLeft',
    click: true,
    key: firstTime,
  });

  keyboard.addKeyHandler({
    handler: {
      handleEvent() {
        const { textArea, cursorStart } = getTextAreaData();
        textArea.selectionStart = Math.max(
          0,
          cursorStart - calculateLineWidth(textArea),
        );
        textArea.selectionEnd = textArea.selectionStart;
      },
    },
    keycode: 'ArrowUp',
    click: true,
    key: firstTime,
  });

  keyboard.addKeyHandler({
    handler: {
      handleEvent() {
        const { textArea, cursorStart } = getTextAreaData();
        textArea.selectionStart = Math.min(
          textArea.value.length,
          cursorStart + calculateLineWidth(textArea),
        );
        textArea.selectionEnd = textArea.selectionStart;
      },
    },
    keycode: 'ArrowDown',
    click: true,
    key: firstTime,
  });

  keyboard.addKeyHandler({
    handler: {
      handleEvent() {
        const {
          textArea, textValue, cursorStart, cursorEnd,
        } = getTextAreaData();

        if (cursorStart === cursorEnd) {
          textArea.value = textValue.substring(0, cursorStart - 1)
          + textValue.substring(cursorEnd);
          textArea.selectionStart = Math.max(0, cursorStart - 1);
        } else {
          textArea.value = textValue.substring(0, cursorStart)
        + textValue.substring(cursorEnd);
          textArea.selectionStart = cursorStart;
        }

        textArea.selectionEnd = textArea.selectionStart;
      },
    },
    keycode: 'Backspace',
    click: true,
    key: firstTime,
  });

  keyboard.addKeyHandler({
    handler: {
      handleEvent() {
        const {
          textArea, textValue, cursorStart, cursorEnd,
        } = getTextAreaData();

        if (cursorStart === cursorEnd) {
          textArea.value = textValue.substring(0, cursorStart)
        + textValue.substring(cursorStart + 1);
        } else {
          textArea.value = textValue.substring(0, cursorStart)
        + textValue.substring(cursorEnd);
        }

        textArea.selectionStart = cursorStart;
        textArea.selectionEnd = cursorStart;
      },
    },
    keycode: 'Delete',
    click: true,
    key: firstTime,
  });
}

function languageSwitchHandler() {
  addLayoutListeners(false);
}

function addKeyboardListeners(firstTime) {
  document.addEventListener('layoutChange', () => {
    languageSwitchHandler();
  });
  addLayoutListeners(firstTime);
  document.addEventListener('keydown', outputHandler);
}

function init() {
  addKeyboardListeners(true);
  builder.build();
}

init();
