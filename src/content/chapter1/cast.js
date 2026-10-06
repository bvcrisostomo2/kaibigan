// Chapter 1's cast (spec §6.3): name, costume (art/costumes.js), bio and where each stands when
// the chapter begins (a level spot; null = not on stage yet). Bios unlock in the Journal.
export const chapter1Cast = [
  { id: 'ibarra', name: 'Crisostomo Ibarra', costume: 'ibarra', homeSpot: null, dir: 'down', bio: 'Juan Crisostomo Ibarra, your childhood friend, home after seven years of study in Europe. The only son of the late Don Rafael Ibarra of San Diego.' },
  { id: 'tiago', name: 'Capitan Tiago', costume: 'tiago', homeSpot: null, dir: 'down', bio: 'Don Santiago de los Santos, your host: one of the richest men in Binondo, and careful to stay on good terms with everyone in power.' },
  { id: 'isabel', name: 'Tía Isabel', costume: 'isabel', homeSpot: 'isabel_stairhead', dir: 'down', bio: "Capitan Tiago's cousin, a sweet-faced old woman who runs his household and receives his guests." },
  { id: 'damaso', name: 'Padre Dámaso', costume: 'damaso', homeSpot: 'damaso_spot', dir: 'down', bio: 'A Franciscan friar, for twenty years the curate of the town of San Diego. He talks much and gestures more.' },
  { id: 'sibyla', name: 'Padre Sibyla', costume: 'sibyla', homeSpot: 'sibyla_spot', dir: 'down', bio: 'A young Dominican friar, the curate of Binondo and once a professor at the college of San Juan de Letran. He weighs every word.' },
  { id: 'guevarra', name: 'Teniente Guevarra', costume: 'guevarra', homeSpot: 'guevarra_spot', dir: 'up', bio: 'An elderly lieutenant of the Guardia Civil: tall, austere and curt of speech.' },
  { id: 'victorina', name: 'Doña Victorina', costume: 'victorina', homeSpot: 'victorina_spot', dir: 'down', bio: 'Doña Victorina de los Reyes de Espadaña, a Filipina who dresses and talks as though she came from Madrid.' },
  { id: 'tiburcio', name: 'Don Tiburcio de Espadaña', costume: 'tiburcio', homeSpot: 'tiburcio_spot', dir: 'down', bio: "Doña Victorina's husband, a quiet, lame Spaniard who keeps to her side." },
  { id: 'newcomer', name: 'The newcomer', costume: 'newcomer', homeSpot: 'newcomer_spot', dir: 'left', bio: 'A young Spaniard lately arrived in the islands, already full of opinions about them.' },
  { id: 'servant', name: 'A servant', costume: 'servant', homeSpot: 'servant_spot', dir: 'down', bio: '' },
];
