import { v4 as uuid } from 'uuid';

export type CookieObj = {
  __rg_cookie_id__: string;
  _roboguruSession: string;
  __tracker_session_id__: string;
  role: string;
  userID: string;
  token?: string;
  refreshToken?: string;
};
export type CookieKeys = keyof CookieObj;

function generateUserID(): string {
  const alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz0123456789";
  let userID = "user";
  for (let i = 0; i < 12; i++) {
    userID += alphanum[Math.floor(Math.random() * alphanum.length)];
  }
  return userID;
}

export function generateCookie(token?: {token: string, refreshToken: string}): string {
  const cookieObj: CookieObj = {
    __rg_cookie_id__: uuid(),
    _roboguruSession: uuid(),
    __tracker_session_id__: uuid(),
    role: "student",
    userID: generateUserID(),
    ...token
  };
  return cookieToString(cookieObj);
}

export function cookieToString(cookie: CookieObj): string {
  return (Object.keys(cookie) as CookieKeys[])
    .reduce((prev: string, curr: CookieKeys, i: number, arr: CookieKeys[]) =>
      `${prev}${curr}=${cookie[curr]}${i != arr.length -1 ? '; ': ''}`, '')
}

export function parseCookie(cookieString: string): CookieObj {
  const cookie: CookieObj = {
    __rg_cookie_id__: "",
    _roboguruSession: "",
    __tracker_session_id__: "",
    userID: "",
    role: "student"
  };
  cookieString
    .split('; ')
    .forEach((cookieItem: string) => {
      const [key, value] = cookieItem.split('=').map(s => s.trim());
      cookie[key as CookieKeys] = value;
    });
  return cookie;
}
