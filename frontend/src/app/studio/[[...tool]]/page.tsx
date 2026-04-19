"use client"

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return (
    <div className="w-full h-screen">
      <NextStudio config={config} />
    </div>
  )
}
