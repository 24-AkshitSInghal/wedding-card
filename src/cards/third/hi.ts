import type { WeddingOverrides } from '../../lib/i18n'

/**
 * हिन्दी: the Hindi version of the third card (the Gupta family's invitation, wedding day only).
 *
 * Only the words live here; dates, times, phone numbers and links come from en.ts.
 * Anything left out falls back to the English text. Events are matched by their `id`.
 */
export const weddingHi: WeddingOverrides = {
  bride: {
    name: 'वाणी',
    family: 'बंसल परिवार',
    parents: 'श्रीमती रेणुका बंसल एवं श्री अनिल कुमार बंसल',
    city: 'मुज़फ़्फ़रनगर, उ.प्र.',
  },
  groom: {
    name: 'स्पर्श',
    family: 'गुप्ता परिवार',
    parents: 'श्रीमती अनीशा गुप्ता एवं श्री दीपक गुप्ता',
    city: 'मुज़फ़्फ़रनगर, उ.प्र.',
  },
  weddingDate: 'शनिवार, 12 दिसंबर 2026',
  location: 'मूलचंद रिसॉर्ट्स, मुज़फ़्फ़रनगर',
  coupleLead: 'प्रेम के इस उत्सव में आप सादर आमंत्रित हैं',
  coupleInvite: 'दो दिल, एक सुंदर शुरुआत',
  invitationMessage:
    'श्रीमती सरला रानी एवम श्री हरिशरण गुप्ता (भगत) बड़े हर्ष एवम उल्लास के साथ अपने सुपौत्र के शुभ विवाह समारोह में सादर आमंत्रित करते हैं।',
  brideParentsPrefix: 'सुपुत्री:',
  groomParentsPrefix: 'सुपुत्र:',
  closing: {
    lead: 'सप्रेम',
    message: 'प्रेम, हँसी और उत्सव की इस संध्या में हमारे साथ अवश्य पधारें!',
  },
  rsvp: {
    label: 'कृपया पुष्टि करें',
  },
  events: {
    'chadat': {
      title: 'चढ़त',
      venue: 'मूलचंद रिसॉर्ट्स',
      address: '8वाँ किमी पत्थर, मेरठ रोड, बहादरपुर, मुज़फ़्फ़रनगर, उ.प्र.',
    },
    'shaadi': {
      title: 'शुभ विवाह समारोह',
      venue: 'मूलचंद रिसॉर्ट्स',
      address: '8वाँ किमी पत्थर, मेरठ रोड, बहादरपुर, मुज़फ़्फ़रनगर, उ.प्र.',
    },
    'dinner-12': {
      title: 'प्रीतिभोज',
      venue: 'मूलचंद रिसॉर्ट्स',
      address: '8वाँ किमी पत्थर, मेरठ रोड, बहादरपुर, मुज़फ़्फ़रनगर, उ.प्र.',
    },
  },
  countdown: {
    title: 'दो आत्माओं के एक होने तक',
    scratchLabel: 'खुरचें और देखें',
  },
  story: {
    title: 'हमारी कहानी',
    intro:
      'कुछ प्रेम कहानियाँ सितारों में लिखी होती हैं। हमारी कहानी भरी महफ़िल में एक नज़र से शुरू हुई और हर बीतते मौसम के साथ और भी सुंदर होती गई।',
    chapters: [
      { title: 'पहली मुलाक़ात', text: 'दो परिवार मिले और दो दिलों ने चुपचाप एक-दूसरे को पहचान लिया।' },
      { title: 'एहसास', text: 'धीमी-धीमी बातें इस विश्वास में बदल गईं कि सही जीवनसाथी मिल गया है।' },
      { title: 'वचन', text: 'चारों ओर के आशीर्वाद से, एक रिश्ता जीवन भर का वचन बन गया।' },
    ],
  },
  welcome: {
    heartyTitle: 'स्वागतोत्सुक',
    hearty: ['सुमन अग्रवाल एवं मनोज अग्रवाल', 'रश्मि गुप्ता एवं गोपाल गुप्ता', 'अनीशा गुप्ता एवं दीपक गुप्ता'],
    specialTitle: 'दर्शनाभिलाषी',
    special: ['अपूर्वा मित्तल', 'भूमिका मित्तल', 'अमन गुप्ता', 'अनन्या मित्तल', 'अवनि गुप्ता', 'अक्षत मित्तल'],
  },
}
