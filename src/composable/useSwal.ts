import Swal, { type SweetAlertIcon, type SweetAlertOptions } from 'sweetalert2'

const MESSAGE_TYPE_WORD: Record<MessageType, string> = {
  save: '저장',
  update: '수정',
  remove: '삭제',
}
const MESSAGE = {
  save: '저장 하시겠습니까?',
  update: '수정 하시겠습니까?',
  remove: '삭제 하시겠습니까?',
}
// Swal theme 적용이 안되서 composable로 대체...
// * 공식 페이지 대로 진행 했으나 실패.
export default function useSwal(options?: SweetAlertOptions) {
  const nSwal = Swal.mixin({
    color: 'white',
    background: '#2d2d2d',
    iconColor: '#bc4f30',
    confirmButtonColor: '#bc4f30',
    denyButtonColor: 'gray',
    cancelButtonColor: 'gray',
    icon: 'info',
    showCancelButton: true,
    ...options,
  })
  const nToast = nSwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    showCancelButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer
      toast.onmouseleave = Swal.resumeTimer
    },
  })

  const fireCustom = (options?: SweetAlertOptionsCustom) => {
    const swal = options?.toast ? nToast : nSwal
    const messageType = options?.messageType ?? 'save'

    let icon: SweetAlertIcon = 'success'
    const word = MESSAGE_TYPE_WORD[messageType]
    let title = `${word} 되었습니다`
    if (options?.isConfirm) {
      icon = 'question'
      title = `${word} 하시겠습니까?`
    }

    if (options?.isConfirm) {
      return swal
        .fire({
          title,
          icon,
          ...options,
        })
        .then((res) => {
          return res.isConfirmed
        })
    } else {
      return swal.fire({
        title,
        icon,
        ...options,
      })
    }
  }

  return Object.assign(nSwal, { fireCustom, MESSAGE })
}

type MessageType = 'save' | 'update' | 'remove'
type SweetAlertOptionsCustom = SweetAlertOptions & {
  isConfirm?: boolean
  messageType?: MessageType
}
