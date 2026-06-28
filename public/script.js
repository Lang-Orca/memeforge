const generateButton = document.getElementById('generateButton');
const statusEl = document.getElementById('status');
const memeText = document.getElementById('memeText');
const resultSection = document.getElementById('result');
const memeImage = document.getElementById('memeImage');
const downloadButton = document.getElementById('downloadButton');
const copyUrlButton = document.getElementById('copyUrlButton');

const apiUrl = '/api/generate-meme';

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function showResult(url) {
  memeImage.src = url;
  resultSection.classList.remove('hidden');
}

function hideResult() {
  resultSection.classList.add('hidden');
  memeImage.src = '';
}

function downloadImage(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = 'memeforge-meme.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function copyUrl(url) {
  if (!navigator.clipboard) {
    setStatus('Copie impossible sur ce navigateur.', true);
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    setStatus('URL copiée dans le presse-papiers.');
  } catch (err) {
    setStatus('Impossible de copier l’URL.', true);
  }
}

async function generateMeme() {
  const text = memeText.value.trim();
  hideResult();

  if (!text) {
    setStatus('Veuillez saisir un texte de mème.', true);
    return;
  }

  setStatus('Génération en cours...');
  generateButton.disabled = true;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur de génération.');
    }

    if (!data.imageUrl) {
      throw new Error('Aucune URL de mème reçue.');
    }

    showResult(data.imageUrl);
    setStatus('Mème prêt !');
  } catch (error) {
    setStatus(error.message || 'Erreur réseau.', true);
  } finally {
    generateButton.disabled = false;
  }
}

generateButton.addEventListener('click', generateMeme);
downloadButton.addEventListener('click', () => downloadImage(memeImage.src));
copyUrlButton.addEventListener('click', () => copyUrl(memeImage.src));
