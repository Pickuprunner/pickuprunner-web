
import { BLUE, YELLOW } from '../../lib/brand'
import { Boxes, Camera, Car, CreditCard, FileText, Gift, KeyRound, MapPin, Navigation, Receipt, Shield, Smartphone, Undo2, Wallet } from 'lucide-react'

export const STEPS = [
  { step: '01', icon: Smartphone, title: 'Get the app', desc: 'Download Pickup Runner on iOS or Android. Free to install — no subscription, no membership.', color: BLUE },
  { step: '02', icon: MapPin, title: 'Set both addresses', desc: 'Where it is now, and where it needs to go. Save the places you send from often.', color: YELLOW },
  { step: '03', icon: Boxes, title: 'Prepare your pickup', desc: 'Pay for any goods before collection. Describe your items and add a collection reference and handoff instructions. Review the delivery price before you confirm.', color: BLUE },
  { step: '04', icon: Navigation, title: 'Track it door to door', desc: 'Follow your runner live from collection to handoff, and get a delivery photo when it lands.', color: YELLOW },
]

export const SEND_CATEGORIES = [
  { icon: FileText, title: 'Documents & paperwork', desc: 'Contracts, signed forms, certificates, passports for an appointment — delivered between local addresses.' },
  { icon: KeyRound, title: 'The thing you left behind', desc: 'Keys, wallet, phone charger, the laptop still on the kitchen table. Sent to wherever you actually are.' },
  { icon: Boxes, title: 'Parcels & packages', desc: 'Anything boxed or bagged that fits in a car and one person can carry comfortably.' },
  { icon: Gift, title: 'Gifts & occasions', desc: 'A birthday present, flowers, or a cake that needs to get across the city today, not in three days.' },
  { icon: Car, title: 'Business runs', desc: 'Stock between your branches, samples to a client, tools to a job site, deposits to the accountant.' },
  { icon: Undo2, title: 'Returns & drop-offs', desc: 'To a courier depot, a repair shop, a landlord, or a friend who has been asking for their dish back.' },
]

export const APP_FEATURES = [
  { icon: Wallet, title: 'Price before you commit', desc: 'Base fee, mileage, and tip are itemised on screen. You approve the total before a runner is assigned.' },
  { icon: Navigation, title: 'Live tracking', desc: 'Watch your runner from the moment they accept, through collection, to the drop-off address.' },
  { icon: Camera, title: 'Photo proof of delivery', desc: 'Your runner photographs the handoff. It lands in your order screen the second the delivery is marked complete.' },
  { icon: CreditCard, title: 'Pay in the app', desc: 'Card on file, charged once. No cash changing hands at either end of the trip.' },
  { icon: Receipt, title: 'Receipts & history', desc: 'Every send stored with an itemised receipt — useful when you are expensing a courier run.' },
  { icon: Shield, title: 'Vetted runners', desc: 'Criminal background, MVR, and sex offender registry checks before a first delivery.' },
]

export const PRICING = [
  { label: 'Base delivery fee', value: '$10.00', note: 'Flat, every send' },
  { label: 'Mileage', value: '$2.00/mi', note: 'Pickup to drop-off' },
  { label: 'Driver tip', value: '$5 minimum', note: '100% to your runner' },
]


export const FAQ = [
  {
    q: 'Can I book a delivery on this website?',
    a: 'No. Every Pickup Runner delivery is booked through our mobile app. This website explains how the service works, what it costs, and where we operate — delivery bookings are handled in the app.',
  },
  {
    q: 'Will my runner shop or pay for my items?',
    a: 'No. Pickup Runner only collects prepaid items. Pay for your goods first and make sure they are ready for collection. Your runner picks them up and delivers them; runners do not shop, buy goods or pay the store on your behalf.',
  },
  {
    q: 'What can I send?',
    a: 'Anything legal that fits in a car and one person can carry safely on their own — documents, parcels, gifts, forgotten essentials, business stock. If you are unsure whether something qualifies, describe it in the app before you book and we will tell you.',
  },
  {
    q: 'What will you not carry?',
    a: 'Cash and negotiable securities, anything illegal, hazardous or flammable material, live animals, weapons and ammunition, and anything unpackaged that will not survive a car ride. Runners can decline an item at collection if it turns out not to match what was booked.',
  },
  {
    q: 'Does somebody need to be there at both ends?',
    a: 'Someone needs to hand the item over at pickup. At the drop-off you can name a recipient or authorise your runner to leave it in a safe place — either way you get a photo of exactly where it ended up.',
  },
  {
    q: 'How do I pay?',
    a: 'You add a card in the app and the trip is charged once at checkout — base fee, mileage, and your tip. Nobody hands your runner cash, at either address.',
  },
  {
    q: 'How do I know it actually arrived?',
    a: 'Your runner marks the delivery complete and uploads a photo of the handoff or the safe place. That photo, plus the delivery time, is attached to the order in your history.',
  },
  {
    q: 'How far will a runner go?',
    a: 'Up to about 15 miles between pickup and drop-off, seven days a week. Delivery time depends on the route, traffic and driver availability. Coverage widens as more runners join your area.',
  },
  {
    q: 'Where do I get the app?',
    a: 'Pickup Runner is free on the App Store for iPhone and on Google Play for Android — use the buttons at the top of this page, or search "Pickup Runner" in your store.',
  },
]
