
import { Hero, WhereItHappens, Steps, IfYouOweMoney, WhatDeletingDoes, Questions, TalkToUs } from './sections'

export function DeleteProfilePage() {
  return (
    <div className="min-h-screen pt-16">

      <Hero />
      <WhereItHappens />
      <Steps />
      <IfYouOweMoney />
      <WhatDeletingDoes />
      <Questions />
      <TalkToUs />
    </div>
  )
}
