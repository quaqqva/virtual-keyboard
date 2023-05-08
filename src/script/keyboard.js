import keyboardLayout from '../layout/keyboard.html';

const TABLE_RUS = '23467йцукенгшщзхъ\\фывапролджэячсмитьбю.';
const TABLE_ENG = "23467qwertyuiop[]\\asdfghjkl:'zxcvbnm,./";

function isKey({ button, key }) {
  if (button.innerHTML === key) return true;
  const mainKeySpan = button.querySelector('.keyboard-button__main-key');
  if (mainKeySpan && mainKeySpan.innerHTML === key) return true;
  if (button.dataset.keycode === key) return true;
  return false;
}

function getButtonOutput({ button, isShift }) {
  if (!button || button.dataset.keycode === 'LangSwitch' || button.dataset.keycode === 'Backspace') return '';
  if (button.dataset.keycode === 'Space') return ' ';
  if (button.dataset.keycode === 'Enter') return '\n';
  if (button.dataset.keycode === 'Tab') return '\t';
  if ((!button.classList.contains('keyboard__button_secondary') && !button.classList.contains('keyboard__button_arrow'))
    || button.dataset.keycode === 'Backquote') {
    if (isShift) return (button.querySelector('.keyboard-button__additional-key') || button).innerHTML;
    return (button.querySelector('.keyboard-button__main-key') || button).innerHTML;
  }
  return '';
}

function getButtonTarget(event) {
  if (event.target instanceof HTMLButtonElement) return event.target;
  return event.target.parentNode;
}

export default class Keyboard {
  lastOutput = '';

  ADDITIONALS_RUS = {
    2: '"',
    3: '№',
    4: ';',
    6: ':',
    7: '?',
    '\\': '/',
    '.': ',',
  };

  ADDITIONALS_ENG = {
    2: '@',
    3: '#',
    4: '$',
    6: '^',
    7: '&',
    '[': '{',
    ']': '}',
    '\\': '|',
    ';': ':',
    "'": '"',
    ',': '<',
    '.': '>',
    '/': '?',
  };

  BUTTON_TRANSITION = 300;// ms

  caseEventHandler = this.caseHandler.bind(this);

  shiftHandler = this.switchShift.bind(this);

  constructor(language) {
    this.language = language;
    this.table = language === 'en' ? TABLE_ENG : TABLE_RUS;
    this.isCaps = false;
    this.isShift = false;
    this.loadLayout();
    this.addDocListeners();
  }

  createLayout() {
    const wrapper = document.createElement('template');
    wrapper.insertAdjacentHTML('afterbegin', keyboardLayout);
    this.layoutElement = wrapper.firstChild;
  }

  getLayout = () => this.layoutElement;

  getButtonLayout(index) {
    const addTable = this.language === 'en' ? this.ADDITIONALS_ENG : this.ADDITIONALS_RUS;

    if (Object.prototype.hasOwnProperty.call(addTable, this.table[index])) {
      const mainKeySpan = document.createElement('span');
      mainKeySpan.className = 'keyboard-button__main-key';
      mainKeySpan.innerHTML = this.table[index];

      const addKeySpan = document.createElement('span');
      addKeySpan.className = 'keyboard-button__additional-key';
      addKeySpan.innerHTML = addTable[this.table[index]];

      return addKeySpan.outerHTML + mainKeySpan.outerHTML;
    }
    return this.table[index];
  }

  loadLayout() {
    const oldLayout = this.getLayout();
    this.createLayout();

    let keyIndex = 0;
    Array.from(this.layoutElement.children).forEach((keyboardRow) => {
      const emptyButtons = Array.from(keyboardRow.children)
        .filter((button) => button.innerHTML === '' && !button.classList.contains('keyboard__button_spacebar'));
      for (let i = 0; i < emptyButtons.length; i += 1) {
        emptyButtons[i].innerHTML = this.getButtonLayout(keyIndex);
        keyIndex += 1;
      }
    });

    if (this.isCaps) {
      const capsButton = this.findButton('CapsLock');
      capsButton.classList.toggle('keyboard__caps-lock_active');
    }

    if (oldLayout) {
      const event = new Event('layoutChange', { bubbles: true });
      oldLayout.dispatchEvent(event);
    }

    this.addLayoutListeners();
  }

  switchLanguage() {
    this.language = this.language === 'en' ? 'ru' : 'en';
    this.getTable(true);
    localStorage.setItem('keyboardLanguage', this.language);
    Array.from(this.layoutElement.children).forEach((row) => {
      const alphaNumerics = Array.from(row.children)
        .filter((button) => button.classList.length === 1);
      for (let i = 0; i < alphaNumerics.length; i += 1) alphaNumerics[i].style = 'transform: rotate(360deg)';
    });

    setTimeout(() => {
      this.loadLayout();
    }, this.BUTTON_TRANSITION - 50);
  }

  getTable() {
    this.table = this.language === 'en' ? TABLE_ENG : TABLE_RUS;
    if ((this.isCaps || this.isShift)
     && !(this.isCaps && this.isShift)) { this.table = this.table.toUpperCase(); }
  }

  toggleCase() {
    // for animation:
    // find all letter keys
    let alphabet = this.language === 'en' ? 'abcdefghijklmnopqrstuvwxyz' : 'абвгдеёжзийклмнопрстуфхцчшщьъыэюя';
    const upperCase = (this.isCaps && this.isShift)
     || this.findButton(alphabet[0].toUpperCase()) !== null;
    if (upperCase) alphabet = alphabet.toUpperCase();
    const letterKeys = [];
    Array.from(this.layoutElement.children).forEach((row) => {
      const filteredKeys = Array.from(row.children)
        .filter((button) => {
          const buttonOutput = getButtonOutput({ button, isShift: false });
          return buttonOutput.length === 1 && alphabet.includes(buttonOutput);
        });
      letterKeys.push(...filteredKeys);
    });
    // Change content
    letterKeys.forEach((key) => {
      const curKey = key;
      curKey.style = `transform: ${upperCase ? 'none' : 'rotate(360deg)'}`;
      curKey.innerHTML = upperCase ? key.innerHTML.toLowerCase() : key.innerHTML.toUpperCase();
    });
  }

  toggleShiftAnimation() {
    // Find all 2-span keys
    const spanKeys = [];
    Array.from(this.layoutElement.children).forEach((row) => {
      const filteredKeys = Array.from(row.children)
        .filter((button) => button.querySelector('.keyboard-button__additional-key'));
      spanKeys.push(...filteredKeys);
    });
    // Change span styles
    spanKeys.forEach((key) => {
      const mainKeySpan = key.querySelector('.keyboard-button__main-key');
      const additionalSpan = key.querySelector('.keyboard-button__additional-key');
      mainKeySpan.classList.toggle('keyboard-button__main-key_shift');
      additionalSpan.classList.toggle('keyboard-button__additional-key_shift');
    });
  }

  addDocListeners() {
    document.addEventListener('keydown', this.highlightHandler.bind(this));
    document.addEventListener('keydown', this.registerOutput.bind(this));
    document.addEventListener('keydown', this.caseEventHandler);
    document.addEventListener('keyup', this.caseEventHandler);
    document.addEventListener('keydown', this.languageSwitchClickHandler.bind(this));
    document.addEventListener('keyup', this.highlightHandler.bind(this));
  }

  addLayoutListeners() {
    this.addOnClickListener({ handleEvent: this.registerOutput.bind(this) });
    this.addOnClickListener({ handleEvent: this.caseEventHandler });
    this.addOnClickListener({ handleEvent: this.languageSwitchClickHandler.bind(this) });
    this.findButton('LangSwitch').addEventListener('click', this.switchLanguage.bind(this));

    const leftShiftButton = this.findButton('ShiftLeft');
    const rightShiftButton = this.findButton('ShiftRight');
    leftShiftButton.addEventListener('mousedown', this.shiftHandler);
    rightShiftButton.addEventListener('mousedown', this.shiftHandler);
    rightShiftButton.addEventListener('mouseup', this.shiftHandler);
    leftShiftButton.addEventListener('mouseup', this.shiftHandler);
  }

  addOnClickListener(listener) {
    const handler = (event) => {
      if (event.target instanceof HTMLButtonElement
         || event.target instanceof HTMLSpanElement) listener.handleEvent(event);
    };
    this.layoutElement.addEventListener('click', handler);
  }

  getTargetKey(event) {
    let result = event.code;
    if (result.substring(0, 3) === 'Key') {
      result = result.substring(3);
      if (this.table === this.table.toLowerCase()) result = result.toLowerCase();
      if (this.language === 'ru') result = this.table[[...TABLE_ENG].findIndex((c) => c === result.toLowerCase())];
    }
    if (result.substring(0, 5) === 'Digit') result = result.substring(5);
    return result;
  }

  findButton(keycode) {
    let pressedButton = null;
    const rows = Array.from(this.layoutElement.children);
    for (let i = 0; i < rows.length && pressedButton === null; i += 1) {
      const buttons = Array.from(rows[i].children);
      for (let j = 0; j < buttons.length && pressedButton === null; j += 1) {
        if (isKey({ button: buttons[j], key: keycode })) pressedButton = buttons[j];
      }
    }
    return pressedButton;
  }

  highlightHandler(event) {
    if (event.repeat) return;
    const pressedButton = this.findButton(this.getTargetKey(event));
    if (pressedButton && event.type === 'keydown') pressedButton.classList.add('keyboard__button_active');
    if (pressedButton && event.type === 'keyup') pressedButton.classList.remove('keyboard__button_active');
  }

  switchShift() {
    this.isShift = !this.isShift;
    this.toggleShiftAnimation();
    this.toggleCase();
    this.getTable();
  }

  caseHandler(event) {
    if (event.repeat) return;
    if ((event.type === 'keydown' && event.code === 'CapsLock') || event.target.dataset.keycode === 'CapsLock') {
      const capsButton = this.findButton('CapsLock');
      capsButton.classList.toggle('keyboard__caps-lock_active');
      this.toggleCase();
      this.isCaps = !this.isCaps;
      this.getTable();
    }
    if ((event.code && event.code.substring(0, 5) === 'Shift')) this.switchShift();
  }

  isAlt() {
    const leftAlt = this.findButton('AltLeft');
    const rightAlt = this.findButton('AltRight');
    return leftAlt.matches('.keyboard__button_active') || leftAlt.matches('.keyboard__button:active')
     || rightAlt.matches('.keyboard__button_active') || rightAlt.matches('.keyboard__button:active');
  }

  registerOutput(event) {
    const pressedButton = event.code
      ? this.findButton(this.getTargetKey(event))
      : getButtonTarget(event);
    if (!pressedButton) {
      this.lastOutput = '';
      return;
    }
    const buttonContent = getButtonOutput({ button: pressedButton, isShift: this.isShift });
    this.lastOutput = buttonContent;
  }

  addKeyHandler({
    handler, keycode, key, click,
  }) {
    if (key) {
      const keyDownHandler = (event) => {
        if (event.code === keycode) handler.handleEvent(event);
      };
      document.addEventListener('keydown', keyDownHandler);
    }
    if (click) {
      const clickHandler = (event) => {
        if (getButtonTarget(event) === this.findButton(keycode)) handler.handleEvent(event);
      };
      this.getLayout().addEventListener('click', clickHandler);
    }
  }

  languageSwitchClickHandler() {
    if (this.isShift && this.isAlt()) this.switchLanguage();
  }
}
