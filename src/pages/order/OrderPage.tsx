/** /order — how sending something with a runner works. */

import { Hero, WhatWeMove, HowItWorks, WhatPeopleSend, AppFeatures, Pricing, Questions, GetTheApp } from './sections'

export function OrderPage() {
  return (
    <div className="min-h-screen pt-16">

      <Hero />
      <WhatWeMove />
      <HowItWorks />
      <WhatPeopleSend />
      <AppFeatures />
      <Pricing />
      <Questions />
      <GetTheApp />
    </div>
  )
}
