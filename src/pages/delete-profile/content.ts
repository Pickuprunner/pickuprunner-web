
import { BLUE, RED, YELLOW } from '../../lib/brand'
import { ChevronRight, CircleUser, Keyboard, Trash2 } from 'lucide-react'

export const STEPS = [
  {
    step: '01',
    icon: CircleUser,
    title: 'Click on Profile',
    desc: 'Open the Pickup Runner app and tap Profile. Scroll to the bottom of the screen and choose Delete account.',
    color: BLUE,
  },
  {
    step: '02',
    icon: ChevronRight,
    title: 'Click Continue and confirm',
    desc: 'A summary explains what deleting removes. Tap Continue, then confirm you want to carry on.',
    color: YELLOW,
  },
  {
    step: '03',
    icon: Keyboard,
    title: 'Type DELETE',
    desc: 'Type the word DELETE in capitals into the box. This step exists so the account can never go in a mis-tap.',
    color: BLUE,
  },
  {
    step: '04',
    icon: Trash2,
    title: 'Permanently delete my account',
    desc: 'Tap Permanently delete my account. Your account closes straight away and you are signed out on every device.',
    color: RED,
  },
]

export const REMOVED = [
  'Your email address and phone number',
  'Your name and password',
  'Saved addresses and profile details',
]

export const KEPT = [
  'Past delivery records, with nothing that identifies you',
  'Receipts we are required to keep for tax and accounting',
]

export const FAQ = [
  {
    q: 'Can I delete my account from this website?',
    a: 'No. Deletion happens inside the Pickup Runner app, on your own signed-in account — that is what proves the request is really coming from you. This page is the written guide to the steps.',
  },
  {
    q: 'Why can I not delete while an order is in progress?',
    a: 'A delivery in flight involves your runner and, at the drop-off, somebody expecting a handoff. Closing the account mid-trip would leave that order with nobody to contact. Once every order has been delivered or cancelled, deletion goes through immediately.',
  },
  {
    q: 'Can I undo it?',
    a: 'No. Deletion is permanent and there is no recovery window, which is exactly why the app asks you to type DELETE first. Nobody at Pickup Runner can restore a closed account.',
  },
  {
    q: 'Can I sign up again later with the same email?',
    a: 'Yes. Your email address is released when the account closes, so you can create a fresh account with it whenever you like. It starts empty — none of your old history carries over.',
  },
  {
    q: 'I drive for Pickup Runner. Is it different for me?',
    a: 'One extra check. As well as open deliveries, we look for earnings that have been paid by a customer but not yet transferred to you. Deletion is held until that money reaches your account, so closing your profile never costs you a payout.',
  },
  {
    q: 'How long does it take?',
    a: 'The account closes the moment you confirm. Your personal details are removed at that point, not on a delay or a queue.',
  },
]
