const buttons = document.querySelectorAll('.comm-button');
const feedback = document.getElementById('feedback');
const sentenceOutput = document.getElementById('sentence-output');
const speakSentenceButton = document.getElementById('speak-sentence');
const clearSentenceButton = document.getElementById('clear-sentence');
let selectedVoice = null;
let sentence = [];

const chooseVoice = (voices) => {
  const preferred = [
    /en-US/i,
    /Google US English/i,
    /Microsoft Zira/i,
    /Microsoft David/i,
    /Microsoft Mark/i,
    /Microsoft Jenny/i,
    /Samantha/i,
    /Alex/i,
  ];

  return (
    voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('en-us')) ||
    voices.find((voice) => preferred.some((pattern) => pattern.test(voice.name))) ||
    voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('en-')) ||
    voices[0] ||
    null
  );
};

const loadVoices = () => {
  const voices = speechSynthesis.getVoices();
  selectedVoice = chooseVoice(voices);
};

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

const updateSentenceOutput = () => {
  if (!sentenceOutput) return;
  sentenceOutput.textContent = sentence.length ? sentence.join(' ') : 'Tap words to build a sentence.';
};

const sayWord = (word) => {
  if (!('speechSynthesis' in window)) {
    feedback.textContent = `Selected: ${word}`;
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  feedback.textContent = selectedVoice ? `Saying with ${selectedVoice.name}: ${word}` : `Saying: ${word}`;
};

const saySentence = () => {
  if (!sentence.length) {
    feedback.textContent = 'Build a sentence first.';
    return;
  }

  const phrase = sentence.join(' ');
  sayWord(phrase);
};

const clearSentence = () => {
  sentence = [];
  updateSentenceOutput();
  feedback.textContent = 'Sentence cleared.';
};

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const word = button.dataset.word;
    if (!word) return;

    if (sentenceOutput) {
      sentence.push(word);
      updateSentenceOutput();
    }
    sayWord(word);
  });
});

if (speakSentenceButton) {
  speakSentenceButton.addEventListener('click', () => {
    saySentence();
  });
}

if (clearSentenceButton) {
  clearSentenceButton.addEventListener('click', () => {
    clearSentence();
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    const active = document.activeElement;
    if (active?.classList.contains('comm-button')) {
      event.preventDefault();
      active.click();
    }
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}
