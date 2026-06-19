export const CATEGORIES = [
  'Greetings', 'Daily Life', 'Food & Drink', 'Travel', 'Numbers',
  'People', 'Time', 'Health', 'Work', 'Emotions',
];

export const PHRASES = [
  // Greetings
  { id:'g01', en:'Hello', es:'Hola', ipa:'həˈloʊ', cat:'Greetings' },
  { id:'g02', en:'Good morning', es:'Buenos días', ipa:'ɡʊd ˈmɔːrnɪŋ', cat:'Greetings' },
  { id:'g03', en:'Good night', es:'Buenas noches', ipa:'ɡʊd naɪt', cat:'Greetings' },
  { id:'g04', en:'How are you?', es:'¿Cómo estás?', ipa:'haʊ ɑːr juː', cat:'Greetings' },
  { id:'g05', en:"I'm fine, thanks", es:'Estoy bien, gracias', ipa:'aɪm faɪn θæŋks', cat:'Greetings' },
  { id:'g06', en:'Goodbye', es:'Adiós', ipa:'ɡʊdˈbaɪ', cat:'Greetings' },
  { id:'g07', en:'See you later', es:'Hasta luego', ipa:'siː juː ˈleɪtər', cat:'Greetings' },
  { id:'g08', en:'Nice to meet you', es:'Mucho gusto', ipa:'naɪs tə miːt juː', cat:'Greetings' },
  { id:'g09', en:'What is your name?', es:'¿Cómo te llamas?', ipa:'wɒt ɪz jɔːr neɪm', cat:'Greetings' },
  { id:'g10', en:'My name is...', es:'Me llamo...', ipa:'maɪ neɪm ɪz', cat:'Greetings' },

  // Daily Life
  { id:'d01', en:'Where is the bathroom?', es:'¿Dónde está el baño?', ipa:'wɛr ɪz ðə ˈbæθruːm', cat:'Daily Life' },
  { id:'d02', en:'I do not understand', es:'No entiendo', ipa:'aɪ doʊnt ˌʌndərˈstænd', cat:'Daily Life' },
  { id:'d03', en:'Please speak slowly', es:'Habla despacio, por favor', ipa:'pliːz spiːk ˈsloʊli', cat:'Daily Life' },
  { id:'d04', en:'Can you help me?', es:'¿Puedes ayudarme?', ipa:'kæn juː hɛlp miː', cat:'Daily Life' },
  { id:'d05', en:'How much does it cost?', es:'¿Cuánto cuesta?', ipa:'haʊ mʌtʃ dʌz ɪt kɒst', cat:'Daily Life' },
  { id:'d06', en:'I need...', es:'Necesito...', ipa:'aɪ niːd', cat:'Daily Life' },
  { id:'d07', en:'Where can I find...?', es:'¿Dónde puedo encontrar...?', ipa:'wɛr kæn aɪ faɪnd', cat:'Daily Life' },
  { id:'d08', en:'Please', es:'Por favor', ipa:'pliːz', cat:'Daily Life' },
  { id:'d09', en:'Thank you', es:'Gracias', ipa:'θæŋk juː', cat:'Daily Life' },
  { id:'d10', en:'You are welcome', es:'De nada', ipa:'juː ɑːr ˈwɛlkəm', cat:'Daily Life' },
  { id:'d11', en:'Excuse me', es:'Perdón', ipa:'ɪkˈskjuːz miː', cat:'Daily Life' },
  { id:'d12', en:'I am sorry', es:'Lo siento', ipa:'aɪ æm ˈsɒri', cat:'Daily Life' },

  // Food & Drink
  { id:'f01', en:'I am hungry', es:'Tengo hambre', ipa:'aɪ æm ˈhʌŋɡri', cat:'Food & Drink' },
  { id:'f02', en:'I am thirsty', es:'Tengo sed', ipa:'aɪ æm ˈθɜːrsti', cat:'Food & Drink' },
  { id:'f03', en:'The menu, please', es:'La carta, por favor', ipa:'ðə ˈmɛnjuː pliːz', cat:'Food & Drink' },
  { id:'f04', en:'I would like water', es:'Quisiera agua', ipa:'aɪ wʊd laɪk ˈwɔːtər', cat:'Food & Drink' },
  { id:'f05', en:'The bill, please', es:'La cuenta, por favor', ipa:'ðə bɪl pliːz', cat:'Food & Drink' },
  { id:'f06', en:'It is delicious', es:'Está delicioso', ipa:'ɪt ɪz dɪˈlɪʃəs', cat:'Food & Drink' },
  { id:'f07', en:'I am a vegetarian', es:'Soy vegetariano', ipa:'aɪ æm ə vɛdʒɪˈtɛəriən', cat:'Food & Drink' },
  { id:'f08', en:'I am allergic to...', es:'Soy alérgico a...', ipa:'aɪ æm əˈlɜːrdʒɪk tə', cat:'Food & Drink' },
  { id:'f09', en:'A table for two', es:'Una mesa para dos', ipa:'ə ˈteɪbəl fər tuː', cat:'Food & Drink' },
  { id:'f10', en:'Do you have wifi?', es:'¿Tienen wifi?', ipa:'duː juː hæv ˈwaɪfaɪ', cat:'Food & Drink' },

  // Travel
  { id:'t01', en:'Where is the station?', es:'¿Dónde está la estación?', ipa:'wɛr ɪz ðə ˈsteɪʃən', cat:'Travel' },
  { id:'t02', en:'A ticket to...', es:'Un billete a...', ipa:'ə ˈtɪkɪt tə', cat:'Travel' },
  { id:'t03', en:'How do I get to...?', es:'¿Cómo llego a...?', ipa:'haʊ duː aɪ ɡɛt tə', cat:'Travel' },
  { id:'t04', en:'Turn left', es:'Gira a la izquierda', ipa:'tɜːrn lɛft', cat:'Travel' },
  { id:'t05', en:'Turn right', es:'Gira a la derecha', ipa:'tɜːrn raɪt', cat:'Travel' },
  { id:'t06', en:'Straight ahead', es:'Todo recto', ipa:'streɪt əˈhɛd', cat:'Travel' },
  { id:'t07', en:'I am lost', es:'Estoy perdido', ipa:'aɪ æm lɒst', cat:'Travel' },
  { id:'t08', en:'Call a taxi', es:'Llama un taxi', ipa:'kɔːl ə ˈtæksi', cat:'Travel' },
  { id:'t09', en:'Airport', es:'Aeropuerto', ipa:'ˈɛːrpɔːrt', cat:'Travel' },
  { id:'t10', en:'Hotel', es:'Hotel', ipa:'hoʊˈtɛl', cat:'Travel' },

  // Numbers
  { id:'n01', en:'One', es:'Uno', ipa:'wʌn', cat:'Numbers' },
  { id:'n02', en:'Two', es:'Dos', ipa:'tuː', cat:'Numbers' },
  { id:'n03', en:'Three', es:'Tres', ipa:'θriː', cat:'Numbers' },
  { id:'n04', en:'Four', es:'Cuatro', ipa:'fɔːr', cat:'Numbers' },
  { id:'n05', en:'Five', es:'Cinco', ipa:'faɪv', cat:'Numbers' },
  { id:'n06', en:'Ten', es:'Diez', ipa:'tɛn', cat:'Numbers' },
  { id:'n07', en:'Twenty', es:'Veinte', ipa:'ˈtwɛnti', cat:'Numbers' },
  { id:'n08', en:'Fifty', es:'Cincuenta', ipa:'ˈfɪfti', cat:'Numbers' },
  { id:'n09', en:'One hundred', es:'Cien', ipa:'wʌn ˈhʌndrəd', cat:'Numbers' },
  { id:'n10', en:'One thousand', es:'Mil', ipa:'wʌn ˈθaʊzənd', cat:'Numbers' },

  // People
  { id:'p01', en:'Friend', es:'Amigo', ipa:'frɛnd', cat:'People' },
  { id:'p02', en:'Family', es:'Familia', ipa:'ˈfæməli', cat:'People' },
  { id:'p03', en:'Mother', es:'Madre', ipa:'ˈmʌðər', cat:'People' },
  { id:'p04', en:'Father', es:'Padre', ipa:'ˈfɑːðər', cat:'People' },
  { id:'p05', en:'Brother', es:'Hermano', ipa:'ˈbrʌðər', cat:'People' },
  { id:'p06', en:'Sister', es:'Hermana', ipa:'ˈsɪstər', cat:'People' },
  { id:'p07', en:'Son', es:'Hijo', ipa:'sʌn', cat:'People' },
  { id:'p08', en:'Daughter', es:'Hija', ipa:'ˈdɔːtər', cat:'People' },
  { id:'p09', en:'Husband', es:'Esposo', ipa:'ˈhʌzbənd', cat:'People' },
  { id:'p10', en:'Wife', es:'Esposa', ipa:'waɪf', cat:'People' },

  // Time
  { id:'ti01', en:'What time is it?', es:'¿Qué hora es?', ipa:'wɒt taɪm ɪz ɪt', cat:'Time' },
  { id:'ti02', en:'Today', es:'Hoy', ipa:'təˈdeɪ', cat:'Time' },
  { id:'ti03', en:'Tomorrow', es:'Mañana', ipa:'təˈmɒroʊ', cat:'Time' },
  { id:'ti04', en:'Yesterday', es:'Ayer', ipa:'ˈjɛstərdeɪ', cat:'Time' },
  { id:'ti05', en:'Now', es:'Ahora', ipa:'naʊ', cat:'Time' },
  { id:'ti06', en:'Later', es:'Más tarde', ipa:'ˈleɪtər', cat:'Time' },
  { id:'ti07', en:'Morning', es:'Mañana', ipa:'ˈmɔːrnɪŋ', cat:'Time' },
  { id:'ti08', en:'Evening', es:'Tarde', ipa:'ˈiːvnɪŋ', cat:'Time' },
  { id:'ti09', en:'Week', es:'Semana', ipa:'wiːk', cat:'Time' },
  { id:'ti10', en:'Month', es:'Mes', ipa:'mʌnθ', cat:'Time' },

  // Health
  { id:'h01', en:'I need a doctor', es:'Necesito un médico', ipa:'aɪ niːd ə ˈdɒktər', cat:'Health' },
  { id:'h02', en:'I do not feel well', es:'No me siento bien', ipa:'aɪ doʊnt fiːl wɛl', cat:'Health' },
  { id:'h03', en:'It hurts here', es:'Me duele aquí', ipa:'ɪt hɜːrts hɪər', cat:'Health' },
  { id:'h04', en:'Call an ambulance', es:'Llama una ambulancia', ipa:'kɔːl ən ˈæmbjʊləns', cat:'Health' },
  { id:'h05', en:'Pharmacy', es:'Farmacia', ipa:'ˈfɑːrməsi', cat:'Health' },
  { id:'h06', en:'I have a headache', es:'Me duele la cabeza', ipa:'aɪ hæv ə ˈhɛdeɪk', cat:'Health' },
  { id:'h07', en:'Fever', es:'Fiebre', ipa:'ˈfiːvər', cat:'Health' },
  { id:'h08', en:'Allergy', es:'Alergia', ipa:'ˈælərdʒi', cat:'Health' },

  // Work
  { id:'w01', en:'I work at...', es:'Trabajo en...', ipa:'aɪ wɜːrk æt', cat:'Work' },
  { id:'w02', en:'Meeting', es:'Reunión', ipa:'ˈmiːtɪŋ', cat:'Work' },
  { id:'w03', en:'Deadline', es:'Fecha límite', ipa:'ˈdɛdlaɪn', cat:'Work' },
  { id:'w04', en:'Email', es:'Correo electrónico', ipa:'ˈiːmeɪl', cat:'Work' },
  { id:'w05', en:'Office', es:'Oficina', ipa:'ˈɒfɪs', cat:'Work' },
  { id:'w06', en:'Project', es:'Proyecto', ipa:'ˈprɒdʒɛkt', cat:'Work' },
  { id:'w07', en:'Team', es:'Equipo', ipa:'tiːm', cat:'Work' },
  { id:'w08', en:'Schedule', es:'Horario', ipa:'ˈʃɛdjuːl', cat:'Work' },

  // Emotions
  { id:'e01', en:'I am happy', es:'Estoy feliz', ipa:'aɪ æm ˈhæpi', cat:'Emotions' },
  { id:'e02', en:'I am sad', es:'Estoy triste', ipa:'aɪ æm sæd', cat:'Emotions' },
  { id:'e03', en:'I am tired', es:'Estoy cansado', ipa:'aɪ æm ˈtaɪərd', cat:'Emotions' },
  { id:'e04', en:'I am excited', es:'Estoy emocionado', ipa:'aɪ æm ɪkˈsaɪtɪd', cat:'Emotions' },
  { id:'e05', en:'I am stressed', es:'Estoy estresado', ipa:'aɪ æm strɛst', cat:'Emotions' },
  { id:'e06', en:'I am calm', es:'Estoy tranquilo', ipa:'aɪ æm kɑːm', cat:'Emotions' },
  { id:'e07', en:'I love you', es:'Te quiero', ipa:'aɪ lʌv juː', cat:'Emotions' },
  { id:'e08', en:'I miss you', es:'Te echo de menos', ipa:'aɪ mɪs juː', cat:'Emotions' },
  { id:'e09', en:'I am grateful', es:'Estoy agradecido', ipa:'aɪ æm ˈɡreɪtfəl', cat:'Emotions' },
  { id:'e10', en:'I am proud', es:'Estoy orgulloso', ipa:'aɪ æm praʊd', cat:'Emotions' },
];
