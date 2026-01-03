export enum AiCode {
  TTSShort = 'tts-short',
  TTSShortPlus = 'tts-short-plus',
  TTSShortBase = 'tts-short-base',
}

export const Config = {
  [AiCode.TTSShort]: {
    appKey: 'appKey',
    secret: 'secret',
    path: 'servicePath',
  },
};
