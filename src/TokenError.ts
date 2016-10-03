import { IToken } from './Parser';

export class TokenError extends Error {
  constructor(public message: string, public token: IToken) {
    super(message);
    if (token && token.errors)
      token.errors.push(this);
    else
      throw this;
  }

  inspect() {
    return 'SyntaxError: ' + this.message;
  }
}
