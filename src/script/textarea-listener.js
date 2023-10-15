export default class textareaListener {
  constructor(keyboard) {
    this.textarea = document.querySelector('textarea');
    this.keyboard = keyboard;
    this.getInput = () => keyboard.lastOutput;
  }

  INPUT_DELAY = 50;

  getTextareaData() {
    this.textarea.focus();
    const textValue = this.textarea.value;
    const cursorStart = this.textarea.selectionStart;
    const cursorEnd = this.textarea.selectionEnd;
    return {
      textValue, cursorStart, cursorEnd,
    };
  }

  bindHandlerContext(handler) {
    const newHandler = handler;
    newHandler.handleEvent = newHandler.handleEvent.bind(this);
    return newHandler;
  }

  outputHandler = {
    handleEvent(event) {
      event.preventDefault();
      setTimeout(() => {
        const { textValue, cursorStart } = this.getTextareaData();
        const input = this.getInput();
        this.textarea.value = textValue.substring(0, cursorStart) + input
          + textValue.substring(cursorStart);
        if (this.getInput().length > 0) {
          this.textarea.selectionStart = cursorStart + input.length;
          this.textarea.selectionEnd = cursorStart + input.length;
        }
      }, this.INPUT_DELAY);
    },
  };

  arrowRightHandler = {
    handleEvent() {
      this.textarea.selectionStart += 1;
    },
  };

  arrowLeftHandler = {
    handleEvent() {
      const { cursorStart } = this.getTextareaData();
      this.textarea.selectionStart = Math.max(0, cursorStart - 1);
      this.textarea.selectionEnd = this.textarea.selectionStart;
    },
  };

  arrowUpHandler = {
    handleEvent() {
      this.textarea.focus();
      const selection = window.getSelection();
      selection.modify('move', 'backward', 'line');
    },
  };

  arrowDownHandler = {
    handleEvent() {
      this.textarea.focus();
      const selection = window.getSelection();
      selection.modify('move', 'forward', 'line');
    },
  };

  backspaceHandler = {
    handleEvent() {
      const {
        textValue, cursorStart, cursorEnd,
      } = this.getTextareaData();
      if (cursorStart === cursorEnd) {
        this.textarea.value = textValue.substring(0, cursorStart - 1)
        + textValue.substring(cursorEnd);
        this.textarea.selectionStart = Math.max(0, cursorStart - 1);
      } else {
        this.textarea.value = textValue.substring(0, cursorStart)
      + textValue.substring(cursorEnd);
        this.textarea.selectionStart = cursorStart;
      }
      this.textarea.selectionEnd = this.textarea.selectionStart;
    },
  };

  deleteHandler = {
    handleEvent() {
      const {
        textValue, cursorStart, cursorEnd,
      } = this.getTextareaData();
      if (cursorStart === cursorEnd) {
        this.textarea.value = textValue.substring(0, cursorStart)
      + textValue.substring(cursorStart + 1);
      } else {
        this.textarea.value = textValue.substring(0, cursorStart)
      + textValue.substring(cursorEnd);
      }
      this.textarea.selectionStart = cursorStart;
      this.textarea.selectionEnd = cursorStart;
    },
  };

  addKeyHandlers(firstTime) {
    this.keyboard.addOnClickListener(this.bindHandlerContext(this.outputHandler));
    this.keyboard.addKeyHandler({
      handler: this.bindHandlerContext(this.arrowRightHandler),
      keycode: 'ArrowRight',
      click: true,
      key: firstTime,
    });

    this.keyboard.addKeyHandler({
      handler: this.bindHandlerContext(this.arrowLeftHandler),
      keycode: 'ArrowLeft',
      click: true,
      key: firstTime,
    });

    this.keyboard.addKeyHandler({
      handler: this.bindHandlerContext(this.arrowUpHandler),
      keycode: 'ArrowUp',
      click: true,
      key: firstTime,
    });

    this.keyboard.addKeyHandler({
      handler: this.bindHandlerContext(this.arrowDownHandler),
      keycode: 'ArrowDown',
      click: true,
      key: firstTime,
    });

    this.keyboard.addKeyHandler({
      handler: this.bindHandlerContext(this.backspaceHandler),
      keycode: 'Backspace',
      click: true,
      key: firstTime,
    });

    this.keyboard.addKeyHandler({
      handler: this.bindHandlerContext(this.deleteHandler),
      keycode: 'Delete',
      click: true,
      key: firstTime,
    });
  }
}
