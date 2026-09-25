export class MnemoError extends Error {
  constructor(message: string, readonly exitCode = 1) {
    super(message);
    this.name = 'MnemoError';
  }
}
