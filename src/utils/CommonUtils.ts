// 한글 문자열의 초성을 추출하는 함수
export function getInitials(str: string) {
  const cho = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ',
  ]

  let initials = ''

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i)
    if (char >= '가' && char <= '힣') {
      initials += cho[((char.charCodeAt(0) - 44032) / 588) | 0]
    } else {
      initials += char
    }
  }

  return initials
}
