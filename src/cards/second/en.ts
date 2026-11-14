import type { WeddingConfig } from '../../config/wedding.ts'

/**
 * The SECOND card: the Gupta family's invitation (Sparsh's side), in English. Everything
 * shown on this card comes from here. Built with CARD=second.
 */
const LAXMAN_VIHAR_MAP = 'https://www.google.com/maps/search/?api=1&query=60%2F208+Laxman+Vihar+Jansath+Road+Muzaffarnagar'
const MOOLCHAND_MAP = 'https://www.google.com/maps/search/?api=1&query=Moolchand+Resorts+Meerut+Road+Bahadarpur+Muzaffarnagar'

export const wedding: WeddingConfig = {
  // The Gupta family sends this card: Sparsh is named first and the family signs it.
  hostSide: 'groom',
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
    'With the divine blessings of Smt. Sarlarani Gupta and Shri Harisharan Gupta Ji. With immense joy and the blessings of our elders, we invite you to grace the wedding celebration of our beloved son',
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
    // Add the Gupta family's RSVP numbers here, e.g. { name: 'Deepak Gupta', phone: '98xxxxxxxx' }.
    contacts: [],
  },
  audio: { src: '/audio/wedding-song-second.m4a', title: '' },
  timezone: 'Asia/Kolkata',
  siteUrl: '',
  showPlaceholders: true,
  // 8 to 11 December at home, 12 December at Moolchand Resorts. Each day gets its own slide.
  events: [
    {
      id: 'kirtan',
      scene: 'hasta-melap',
      title: 'Kirtan',
      date: '2026-12-08',
      time: '15:00',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'dinner-8',
      scene: 'hasta-melap',
      title: 'Dinner',
      date: '2026-12-08',
      time: '19:30',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'halad-baan',
      scene: 'haldi',
      title: 'Halad Baan',
      date: '2026-12-09',
      time: '11:00',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'mandha',
      scene: 'sangeet',
      title: 'Mandha',
      date: '2026-12-10',
      time: '11:00',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'chak-puja',
      scene: 'sangeet',
      title: 'Chak Puja',
      date: '2026-12-10',
      time: '12:00',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'ladies-sangeet',
      scene: 'sangeet',
      title: 'Ladies Sangeet',
      date: '2026-12-10',
      time: '18:00',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'ghudchadi',
      scene: 'baraat',
      title: 'Ghudchadi Ceremony',
      date: '2026-12-11',
      time: '17:00',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'dinner-11',
      scene: 'baraat',
      title: 'Dinner',
      date: '2026-12-11',
      time: '20:30',
      venue: '60/208, Laxman Vihar',
      address: 'Jansath Road, Muzaffarnagar, U.P.',
      mapUrl: LAXMAN_VIHAR_MAP,
    },
    {
      id: 'shaadi',
      scene: 'varmala',
      title: 'Shaadi Samaroh',
      date: '2026-12-12',
      time: '20:00',
      venue: 'Moolchand Resorts',
      address: '8th km stone, Meerut Road, Bahadarpur, Muzaffarnagar, U.P.',
      mapUrl: MOOLCHAND_MAP,
    },
    {
      id: 'dinner-12',
      scene: 'varmala',
      title: 'Dinner',
      date: '2026-12-12',
      time: '20:30',
      venue: 'Moolchand Resorts',
      address: '8th km stone, Meerut Road, Bahadarpur, Muzaffarnagar, U.P.',
      mapUrl: MOOLCHAND_MAP,
    },
  ],
  eveningLine: '',
  countdown: {
    show: true,
    // "Ganesh Ji ka mantra" from the card; change it to the exact words you want.
    mantra: '॥ ॐ श्री गणेशाय नमः ॥',
    title: 'Until two souls become one',
    scratchLabel: 'Scratch to reveal',
    eventId: 'shaadi',
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
  // No little hearts on this card (an empty name hides the slide).
  littleHearts: { title: '', names: '', message: [] },
  welcome: {
    heartyTitle: 'Hearty Welcome By',
    hearty: ['Anisha - Deepak Gupta', 'Rashmi - Gopal Sharan Gupta', 'Suman - Manoj Agarwal'],
    specialTitle: 'Special Invitation From',
    special: ['Aman Gupta', 'Avni Gupta', 'Apoorva Mittal', 'Bhumika Mittal', 'Annaya Mittal', 'Akshat Mittal'],
  },
}
