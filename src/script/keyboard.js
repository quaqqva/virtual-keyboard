import keyboardLayout from '../layout/keyboard.html';

const TABLE_RUS = '23467йцукенгшщзхъ\\фывапролджэячсмитьбю.'.toUpperCase();
const TABLE_ENG = "23467qwertyuiop[]\\asdfghjkl:'zxcvbnm,./".toUpperCase();

function isKey({ button, key }) {
  if (button.innerHTML === key) return true;
  const mainKeySpan = button.querySelector('.keyboard-button__main-key');
  if (mainKeySpan && mainKeySpan.innerHTML === key) return true;
  if (button.dataset.keycode === key) return true;
  return false;
}

function getTargetKey({ event, language }) {
  let result = event.code;
  if (result.substring(0, 3) === 'Key') {
    result = result.substring(3);
    if (language === 'ru') result = TABLE_RUS[[...TABLE_ENG].findIndex((c) => c === result)];
  }
  if (result.substring(0, 5) === 'Digit') result = result.substring(5);
  return result;
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

  constructor(language) {
    this.language = language;
    this.isCaps = false;
    this.loadLanguageLayout();
    this.addListeners();
  }

  createLayout() {
    const wrapper = document.createElement('template');
    wrapper.insertAdjacentHTML('afterbegin', keyboardLayout);
    this.layoutElement = wrapper.firstChild;
  }

  getLayout = () => this.layoutElement;

  getButtonContent(index) {
    const table = this.language === 'en' ? TABLE_ENG : TABLE_RUS;
    const addTable = this.language === 'en' ? this.ADDITIONALS_ENG : this.ADDITIONALS_RUS;

    if (Object.prototype.hasOwnProperty.call(addTable, table[index])) {
      const mainKeySpan = document.createElement('span');
      mainKeySpan.className = 'keyboard-button__main-key';
      mainKeySpan.innerHTML = table[index];

      const addKeySpan = document.createElement('span');
      addKeySpan.className = 'keyboard-button__additional-key';
      addKeySpan.innerHTML = addTable[table[index]];

      return addKeySpan.outerHTML + mainKeySpan.outerHTML;
    }
    return table[index];
  }

  loadLanguageLayout() {
    this.createLayout();
    let keyIndex = 0;
    Array.from(this.layoutElement.children).forEach((keyboardRow) => {
      const emptyButtons = Array.from(keyboardRow.children)
        .filter((button) => button.innerHTML === '' && !button.classList.contains('keyboard__button_spacebar'));
      for (let i = 0; i < emptyButtons.length; i += 1) {
        emptyButtons[i].innerHTML = this.getButtonContent(keyIndex);
        keyIndex += 1;
      }
    });
  }

  switchLanguage() {
    const event = new Event('langSwitch', { bubbles: true });
    this.getLayout().dispatchEvent(event);

    this.language = this.language === 'en' ? 'ru' : 'en';
    localStorage.setItem('keyboardLanguage', this.language);
    Array.from(this.layoutElement.children).forEach((row) => {
      const alphaNumerics = Array.from(row.children)
        .filter((button) => button.classList.length === 1);
      for (let i = 0; i < alphaNumerics.length; i += 1) alphaNumerics[i].style = 'transform: rotate(360deg)';
    });
    this.loadLanguageLayout();
    this.addLayoutListeners();
  }

  addListeners() {
    document.addEventListener('keydown', this.highlightHandler.bind(this));
    document.addEventListener('keydown', this.registerOutput.bind(this));
    document.addEventListener('keydown', this.languageSwitchClickHandler.bind(this));
    document.addEventListener('keydown', this.capsHandler.bind(this));
    document.addEventListener('keyup', this.highlightHandler.bind(this));
    this.addLayoutListeners();
  }

  addLayoutListeners() {
    this.addOnClickListener({ handleEvent: this.registerOutput.bind(this) });
    this.addOnClickListener({ handleEvent: this.capsHandler.bind(this) });
    this.addOnClickListener({ handleEvent: this.languageSwitchClickHandler.bind(this) });
    this.findButton('LangSwitch').addEventListener('click', this.switchLanguage.bind(this));
  }

  addOnClickListener(listener) {
    const handler = (event) => {
      if (event.target instanceof HTMLButtonElement
         || event.target instanceof HTMLSpanElement) listener.handleEvent(event);
    };
    this.layoutElement.addEventListener('click', handler);
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
    if (event.repeat || event.code === 'CapsLock') return;
    const pressedButton = this.findButton(getTargetKey({ event, language: this.language }));
    if (pressedButton && event.type === 'keydown') pressedButton.classList.add('keyboard__button_active');
    if (pressedButton && event.type === 'keyup') pressedButton.classList.remove('keyboard__button_active');
  }

  capsHandler(event) {
    if (event.repeat) return;
    if (event.code === 'CapsLock' || event.target.dataset.keycode === 'CapsLock') {
      this.isCaps = !this.isCaps;
      const capsButton = this.findButton('Caps Lock');
      capsButton.classList.toggle('keyboard__button_active');
    }
  }

  isShift() {
    const leftShift = this.findButton('ShiftLeft');
    const rightShift = this.findButton('ShiftRight');
    return leftShift.matches('.keyboard__button_active') || leftShift.matches('.keyboard__button:active')
     || rightShift.matches('.keyboard__button_active') || rightShift.matches('.keyboard__button:active');
  }

  isAlt() {
    const leftAlt = this.findButton('AltLeft');
    const rightAlt = this.findButton('AltRight');
    return leftAlt.matches('.keyboard__button_active') || leftAlt.matches('.keyboard__button:active')
     || rightAlt.matches('.keyboard__button_active') || rightAlt.matches('.keyboard__button:active');
  }

  registerOutput(event) {
    const pressedButton = event.code
      ? this.findButton(getTargetKey({ event, language: this.language }))
      : getButtonTarget(event);
    if (!pressedButton) {
      this.lastOutput = '';
      return;
    }
    const buttonContent = getButtonOutput({ button: pressedButton, isShift: this.isShift() });
    if (this.isCaps || this.isShift()) this.lastOutput = buttonContent.toUpperCase();
    else this.lastOutput = buttonContent.toLowerCase();
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
    if (this.isShift() && this.isAlt()) this.switchLanguage();
  }
}
