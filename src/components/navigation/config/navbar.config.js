export const menuButtonPt = {
  root: {
    class: [
      '!h-11',
      '!w-11',
      '!border-transparent',
      '!bg-transparent',
      '!text-surface-700',
      '!shadow-none',
      'transition-all',
      'duration-200',
      'hover:enabled:-translate-y-px',
      'hover:enabled:!bg-slate-100/80',
      'hover:enabled:!text-brand-700',
      'focus-visible:!outline-none',
      'focus-visible:!ring-2',
      'focus-visible:!ring-brand-200',
      'max-[768px]:!h-10',
      'max-[768px]:!w-10',
      'max-[480px]:!h-9',
      'max-[480px]:!w-9',
      'max-[360px]:!h-8',
      'max-[360px]:!w-8',
    ],
  },
}

export const localePt = {
  root: {
    class: [
      '!min-w-[4.7rem]',
      '!rounded-full',
      '!border-transparent',
      '!bg-transparent',
      '!shadow-none',
      'transition-all',
      'duration-200',
      'hover:!bg-slate-100/80',
      'focus-within:!ring-2',
      'focus-within:!ring-brand-200',
      'max-[480px]:!min-w-[4.15rem]',
    ],
  },

  label: {
    class:
      '!px-3 !py-1.5 !text-[0.76rem] !font-extrabold !tracking-[0.08em] !text-surface-900 max-[480px]:!px-2 max-[480px]:!py-1 max-[480px]:!text-[0.7rem]',
  },

  dropdown: {
    class: '!w-7 !text-surface-500 max-[480px]:!w-6',
  },
}
