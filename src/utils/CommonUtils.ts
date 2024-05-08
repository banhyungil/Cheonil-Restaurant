/* eslint-disable */
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
