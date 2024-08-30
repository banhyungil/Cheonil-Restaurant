/* eslint-disable */

import { toDate } from "date-fns";
import _ from "lodash";

// 초성(19개)
const CHO_HANGUL = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
  'ㄹ', 'ㅁ', 'ㅂ','ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
  'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
// 중성(21개)
const JUNG_HANGUL = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 
  'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 
  'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 
  'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];
// 종성(28개)
const JONG_HANGUL = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 
  'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 
  'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 
  'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ','ㅎ',
];
/* eslint-enable */

// 한글 문자열의 초성을 추출하는 함수
export function getInitials(str: string) {
  let initials = ''

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i)
    if (char >= '가' && char <= '힣') {
      initials += CHO_HANGUL[((char.charCodeAt(0) - 44032) / 588) | 0]
    } else {
      initials += char
    }
  }

  return initials
}

/**
 * 시간 정보를 제외한 현재 날짜만 반환
 */
export function today() {
  return toDate(new Date().setHours(0, 0, 0, 0))
}

export function assertionExist<T>(val: T | undefined): asserts val is T {
  if (val == null) throw new Error('fail assertion')
}

export function orderWithList<T, K extends keyof T>(origins: Partial<T>[], targets: T[], key: K) {
  const orderedList = origins.reduce((arr: T[], item) => {
    const tgt = targets.find((tgt) => tgt[key] == item[key])
    if (tgt) arr.push(tgt)
    return arr
  }, [])

  return _.unionBy(orderedList, targets, key)
}
