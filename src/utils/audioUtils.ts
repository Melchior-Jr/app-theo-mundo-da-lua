export const bufferToWav = (abuffer: AudioBuffer): Blob => {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // update data view
      pos += 2;
    }
    offset++; // next source sample
  }

  // create Blob
  return new Blob([buffer], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};

export const trimAudioBuffer = (
  buffer: AudioBuffer,
  start: number,
  end: number,
  context: AudioContext
): AudioBuffer => {
  const duration = end - start;
  const sampleRate = buffer.sampleRate;
  const length = Math.floor(duration * sampleRate);
  const trimmed = context.createBuffer(
    buffer.numberOfChannels,
    length,
    sampleRate
  );

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    const data = buffer.getChannelData(i);
    const trimmedData = trimmed.getChannelData(i);
    const startSample = Math.floor(start * sampleRate);
    for (let j = 0; j < length; j++) {
      trimmedData[j] = data[startSample + j];
    }
  }

  return trimmed;
};

export const applyNormalization = (buffer: AudioBuffer, context: AudioContext): AudioBuffer => {
  const channels = buffer.numberOfChannels;
  let maxVal = 0;

  // Find peak val
  for (let i = 0; i < channels; i++) {
    const data = buffer.getChannelData(i);
    for (let j = 0; j < data.length; j++) {
      if (Math.abs(data[j]) > maxVal) maxVal = Math.abs(data[j]);
    }
  }

  if (maxVal === 0 || maxVal >= 1) return buffer;

  const gain = 1 / maxVal;
  const normalized = context.createBuffer(channels, buffer.length, buffer.sampleRate);

  for (let i = 0; i < channels; i++) {
    const data = buffer.getChannelData(i);
    const normData = normalized.getChannelData(i);
    for (let j = 0; j < data.length; j++) {
      normData[j] = data[j] * gain;
    }
  }

  return normalized;
};

export const applyFilter = async (
  buffer: AudioBuffer, 
  type: 'clear' | 'robot'
): Promise<AudioBuffer> => {
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  if (type === 'clear') {
    // Filtro de Nitidez: Aumenta as frequências altas (presença)
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'highshelf';
    filter.frequency.value = 3000;
    filter.gain.value = 8;
    
    source.connect(filter);
    filter.connect(offlineCtx.destination);
  } else if (type === 'robot') {
    // Efeito Robô: Filtro passa-banda metálico + leve distorção (simplificado)
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = 1000;
    filter.Q.value = 10;
    filter.gain.value = 15;

    source.connect(filter);
    filter.connect(offlineCtx.destination);
  } else if (type === 'space') {
    // Efeito Espacial: Reverb básico (convolved or delay based) - Aqui simplificado com delay
    const delay = offlineCtx.createDelay();
    delay.delayTime.value = 0.15;
    const feedback = offlineCtx.createGain();
    feedback.gain.value = 0.4;
    
    source.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(offlineCtx.destination);
    source.connect(offlineCtx.destination);
  } else if (type === 'megaphone') {
    // Megafone: Bandpass estreito + leve distorção (boost)
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    filter.Q.value = 2;
    
    const gain = offlineCtx.createGain();
    gain.gain.value = 1.5;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(offlineCtx.destination);
  } else if (type === 'telephone') {
    // Telefone: Filtro passa-alto e passa-baixo combinados (300Hz - 3400Hz)
    const hp = offlineCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 400;
    
    const lp = offlineCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000;

    source.connect(hp);
    hp.connect(lp);
    lp.connect(offlineCtx.destination);
  } else if (type === 'monster') {
    // Monstro: Lowpass + boost de graves
    const lp = offlineCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    source.connect(lp);
    lp.connect(offlineCtx.destination);
  } else {
    source.connect(offlineCtx.destination);
  }

  source.start(0);
  return await offlineCtx.startRendering();
};
