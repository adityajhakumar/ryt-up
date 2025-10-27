'use client'

import { useState, useEffect } from 'react'

export function useNickname() {
  const [nickname, setNickname] = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem('rytup-nickname')
    if (stored) {
      setNickname(stored)
    }
  }, [])

  const updateNickname = (newNickname: string) => {
    setNickname(newNickname)
    localStorage.setItem('rytup-nickname', newNickname)
  }

  return { nickname, updateNickname }
}
