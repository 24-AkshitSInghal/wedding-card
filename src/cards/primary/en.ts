import type { WeddingConfig } from '../../config/wedding.ts'

/** This card's words, in English. Everything shown on the card comes from here. */
export const wedding: WeddingConfig = {
  // A "Swipe up" hint at the foot of every page between the opening and the closing.
  pageHint: true,
  bride: {
    name: 'Vani',
    fullName: '',
    family: 'Bansal Family',
    parents: 'Mrs. Renuka Bansal & Mr. Anil Kumar Bansal',
    city: 'Muzaffarnagar, U.P.',
  },
  groom: {
    name: 'Sparsh',
    fullName: '',
    family: 'Gupta Family',
    parents: 'Mrs. Anisha Gupta & Mr. Deepak Gupta',
    city: 'Muzaffarnagar, U.P.',
  },
  weddingDate: 'Saturday, 12th December 2026',
  location: 'Moolchand Resorts, Muzaffarnagar',
  hashtag: '#ForeverCalledSV',
  invocation: '',
  invocationMeaning: '',
  coupleLead: 'You are invited to celebrate love',
  coupleInvite: 'Two hearts, one beautiful beginning',
  invitationMessage:
    'With the divine blessings of Smt. Rajdulari Bansal and Late Shri Ishwar Dayal Bansal Ji. With immense joy and the blessings of our elders, we invite you to grace the wedding celebration of our beloved daughter',
  brideParentsPrefix: 'Daughter of',
  groomParentsPrefix: 'Son of',
  closing: {
    lead: 'With Love',
    message: 'Join us for an evening of love, laughter and celebration!',
    blessing: '',
  },
  rsvp: {
    url: '',
    label: 'Kindly RSVP',
    contacts: [
      { name: 'Ishwar Dayal and Sons, Muzaffarnagar', phone: '9412583551' },
      { name: 'Manik Traders, Muzaffarnagar', phone: '8445093059' },
      { name: 'Ishwar Dayal Anil Kumar, Dehradun', phone: '8909554143' },
    ],
  },
  audio: { src: '/audio/wedding-song.mp3', title: '' },
  timezone: 'Asia/Kolkata',
  siteUrl: '',
  showPlaceholders: true,
  events: [
    {
      id: 'baraat',
      scene: 'baraat',
      title: 'Baraat Swagat',
      note: 'Welcoming our prince with love',
      date: '2026-12-12',
      time: '19:00',
      venue: 'Moolchand Resorts',
      address: '8th km stone, Meerut Road, Bahadarpur, Muzaffarnagar, U.P.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Moolchand+Resorts+Meerut+Road+Bahadarpur+Muzaffarnagar',
    },
    {
      id: 'dinner',
      scene: 'hasta-melap',
      title: 'Dinner',
      note: 'A feast of love, joy and togetherness',
      date: '2026-12-12',
      time: '19:30',
      venue: 'Moolchand Resorts',
      address: '8th km stone, Meerut Road, Bahadarpur, Muzaffarnagar, U.P.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Moolchand+Resorts+Meerut+Road+Bahadarpur+Muzaffarnagar',
    },
  ],
  eveningLine: 'Under the stars',
  countdown: {
    show: true,
    // "Ganesh Ji ka mantra" from the card; change it to the exact words you want.
    mantra: '॥ ॐ श्री गणेशाय नमः ॥',
    title: 'Until two souls become one',
    scratchLabel: 'Scratch to reveal',
  },
  story: {
    title: 'Our Story',
    intro:
      'Some love stories are written in the stars. Ours began with a single glance across a crowded room and has only grown more beautiful with every passing season.',
    chapters: [
      { title: 'The Meeting', text: 'Two families met, and two hearts quietly recognised each other.' },
      { title: 'The Knowing', text: 'Slow conversations turned into the certainty of finding the right person.' },
      { title: 'The Promise', text: 'With blessings all around, a connection became a forever promise.' },
    ],
  },
  littleHearts: {
    title: 'Our Little Hearts Welcome You',
    names: 'Gauvangi & Aniksha',
    message: [
      'Tiny hands, cheerful smiles, and lots of love to make you feel special!',
      'Dear guests, your presence means the world to us. With happy hearts and warm smiles, we welcome you to the wedding celebration of Vani and Sparsh.',
      'Your love, blessings and presence will make our celebration even more beautiful!',
    ],
  },
  welcome: {
    heartyTitle: 'Hearty Welcome By',
    hearty: ['Renuka - Anil Kumar Bansal', 'Prerna - Sushil Bansal', 'Mansi - Praveen Bansal', 'Sakshi - Manik Bansal'],
    specialTitle: 'Special Invitation From',
    special: ['Vandana - Alok Ji', 'Akshita - Sparsh Ji', 'Avish', 'Pranav', 'Paridhi', 'Aryan', 'Lakshay', 'Aarushi'],
  },
}
