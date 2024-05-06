import type { SweetAlertOptions } from 'sweetalert2'
import Swal from 'sweetalert2'

export const MESSAGE_INFO = {
  create: '등록 되었습니다.',
  update: '수정 되었습니다.',
  remove: '삭제 되었습니다.',
  confirm: {
    create: '등록 하시겠습니까?',
    update: '수정 하시겠습니까?',
    remove: '삭제 하시겠습니까?',
  },
}
export default function useSwal(option?: SweetAlertOptions) {
  let result: typeof Swal
  if (option?.toast) {
    result = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer
        toast.onmouseleave = Swal.resumeTimer
      },
      ...option,
    })
  } else {
    result = Swal.mixin({
      showConfirmButton: true,
      showCancelButton: true,
      ...option,
    })
  }

  const create = () => {
    result.fire({ title: MESSAGE_INFO.create, icon: 'success' })
  }
  const update = () => {
    result.fire({ title: MESSAGE_INFO.update, icon: 'success' })
  }
  const remove = () => {
    result.fire({ title: MESSAGE_INFO.remove, icon: 'success' })
  }

  const isConfirm = async (type: 'create' | 'update' | 'remove') => {
    const res = await (() => {
      switch (type) {
        case 'create':
          return result.fire({ title: MESSAGE_INFO.confirm.create, icon: 'question' })
        case 'update':
          return result.fire({ title: MESSAGE_INFO.confirm.update, icon: 'question' })
        case 'remove':
          return result.fire({ title: MESSAGE_INFO.confirm.remove, icon: 'question' })
        default:
          throw new Error('not support case')
      }
    })()
    return res.isConfirmed
  }

  return Object.assign(result, { create, update, remove, isConfirm })
}
