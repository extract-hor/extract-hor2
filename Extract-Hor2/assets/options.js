/*
 * 
 *   INITIALISATION DU GESTIONNAIRE DE MESSAGE
 *   OPTION PAGE
 * 
 */

// Récupérer et afficher les données via le message dans l'url
const elements = getQueryParams();


//Découper les éléments avec \\n
const eventsString = elements;
//Convertir les données event en tableau
const eventsArray = eventsString.split("\\n");
// Créer un tableau d'objets pour stocker les événements un a un
const groupedEvents = [];
//striper le premier undefined
eventsArray[0]=stripUndefined(eventsArray[0]);
// Boucle principale pour créer les objets événement
i=0;
do{
    dateEvenement = eventsArray[i];
    heuredebut = eventsArray [i+1];
    heurefin = eventsArray[i+2];
    description = eventsArray[i+3];
    if(extraireDate(eventsArray[i+4])){
        endroit = '';
        i+=4;//pas de local indiqué
    }else{
        endroit = eventsArray[i+4];
        i+=5; //local présent un élément de plus
    }
    
    // Créer un objet événement et l'ajouter au tableau
    groupedEvents.push({
        dateEvenement,
        heuredebut,
        heurefin,
        description,
        endroit
    });
}while(i<eventsArray.length);
//Récupérer le tableau de données et convertir dans les deux formats ics et json
var icsContent = generateIcsFile(groupedEvents);
var jsonContent = JSON.stringify(groupedEvents);
var csvContent = generateCSVFile(groupedEvents);
//Mettre les chaines avec les événements dans les zones de texte
document.getElementById('text-val').textContent = icsContent;
document.getElementById('json-val').textContent = jsonContent;
document.getElementById('csv-val').textContent = csvContent;







/*
*  Générer l'affichage dans le formulaire
*
*/
  /**
   * fonction pour convertir la date en dt pour ical
   * @param {aaaa-mm-dd} events 
   * @returns aaaammdd
   */
  function formatDateForIcal(date) {
    // Séparer les parties de la date
    const [annee, mois, jour] = date.split('-');
  
    // Reconstituer la date dans le nouveau format
    const nouvelleDate = `${annee}${mois}${jour}`;
    return nouvelleDate;
  }

/**
 * fonction pour transformer l'heure en ics
 * 7:30 devient 070000
 * @param {*} heure 
 * @returns 
 */
  function formatHeureForIcal(heure) {
    // Séparer les heures et les minutes
    const [hours, minutes] = heure.split(':');
  
    // Ajouter des zéros si nécessaire
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
  
    // Concaténer les heures, minutes et secondes (initialisées à 00)
    return `${formattedHours}${formattedMinutes}00`;
  }


  

/*
*  Fonction pour créer le fichier ics
*
*
*
*
*/
function generateIcsFile(events) {
    var icsContent = 'BEGIN:VCALENDAR';
    icsContent+='\nVERSION:2.0';
    icsContent+='\nPRODID:-//Your Company//My Calendar//EN';
    icsContent+='\nCALSCALE:GREGORIAN';
    events.forEach(event => {    
      icsContent += `\nBEGIN:VEVENT`;
      icsContent += `\nDTSTART;TZID=America/Montreal:${formatDateForIcal(event.dateEvenement)}T${formatHeureForIcal(event.heuredebut)}`;
      icsContent += `\nDTEND;TZID=America/Montreal:${formatDateForIcal(event.dateEvenement)}T${formatHeureForIcal(event.heurefin)}`;
      icsContent += `\nSUMMARY:${event.description}`;
      icsContent += `\nLOCATION:${event.endroit}`;
      icsContent += `\nEND:VEVENT`; 
    });
  
    icsContent += "\nEND:VCALENDAR";
    return icsContent;
  }


/*
*
*  Fonction pour extraire la date d'une chaine
*
*
*/
function extraireDate(chaine) {
    if(chaine!=undefined){
        // Expression régulière pour supprimer tout avant la date
        const regex = /[^0-9-]+$/;
        const dateString = chaine.replace(regex, '');
    
        // Expression régulière pour vérifier le format AAAA-MM-JJ
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(dateString)) {
            return dateString;
            } else {
            return false;
            }
    }else{
        return false;
    }
  }



/*
*
*   Gestion des messages entre fenêtre
*
*
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, response) {
    //Voir d'ou vient le message
  
    var textzone = document.getElementById('text-val');
    textzone.innerHTML =''; //Effacer le contenu de la zone de texte
    
    switch(request.message){
        case 'updatetextzone':       
                    
                    
                    //textzone.innerHTML = request.textzone;
                    
                    response({message: 'La zone de texte est remplie'});
                    break;
                    
        
                    
                    
        default:
                    response({message: "option invalide"});
                    break;                    
                    
            
    }
  }
);


/*
*   Récupération des données horaires via url
*
*
*/
// Fonction pour récupérer les paramètres de l'URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data'); // Récupérer la chaîne JSON

    // Décoder et analyser la chaîne JSON
    return data ? data : 'Aucune donnee';
}


/*
*
*  Nettoyer la première date enlever undefined
*
*
*/
function stripUndefined(chaine) {
    // Expression régulière pour chercher un motif de date au format AAAA-MM-JJ
    const regex = /\d{4}-\d{2}-\d{2}/;
    const match = chaine.match(regex);

    // Si une date est trouvée, on la retourne
    if (match) {
        return match[0];
    } else {
        return false;
    }
}

/*
*
*  Fonction pour créer des vevents 
*
*
*/
function createICalEvent(eventData) {
    const [startDate, startTime, endTime, summary, location] = eventData;
  
    // ... (code pour créer l'événement iCal)
  
    // Exemple simplifié en incluant le lieu si disponible :
    const iCalEvent = `BEGIN:VEVENT
  DTSTART;VALUE=DATE-TIME:${startDate}T${startTime}00
  DTEND;VALUE=DATE-TIME:${startDate}T${endTime}00
  SUMMARY:${summary}`;
  
    if (location) {
      iCalEvent += `\nLOCATION:${location}`;
    }
  
    iCalEvent += `
  END:VEVENT`;
  
    return iCalEvent;
  }







/**
 * Tableau de données
 * @param {*} groupedEvents 
 */
function generateCSVFile(groupedEvents) {
  // Définir les en-têtes du CSV
  const headers = ['dateEvenement', 'heuredebut', 'heurefin', 'description', 'endroit'];
  
  // Ajouter les en-têtes au contenu CSV
  let csvContent = headers.join(',') + '\n';
  
  // Ajouter chaque événement au contenu CSV
  groupedEvents.forEach(event => {
      const row = [
          event.dateEvenement,
          event.heuredebut,
          event.heurefin,
          event.description,
          event.endroit
      ].join(',');
      csvContent += row + '\n';
  });

  return csvContent;
}










/*
 * TÉLÉCHARGER LES ÉVÉNÉMENTS SOUS FORME DE FICHIER ICS
 * 
 * 
 * 
 */
function downloadical(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Traitement du bouton iCal
document.getElementById("dwn-btn-ical").addEventListener("click", function(){
    // Generate download of hello.txt file with some content
    var text = document.getElementById("text-val").value;
    var filename = "calendrier.ics";    
    downloadical(filename, text);
}, false);







/*
 * TÉLÉCHARGER LES ÉVÉNÉMENTS SOUS FORME DE FICHIER JSON
 * 
 * 
 * 
 */
function downloadjson(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
// Traitement du bouton Excel
document.getElementById("dwn-btn-json").addEventListener("click", function(){
  // Appeler la fonction pour générer le fichier 
    // Generate download of hello.txt file with some content
    var text = document.getElementById("json-val").value;

    var filename = "calendrier.json";    
    downloadjson(filename, text);
}, false);



/*
 * TÉLÉCHARGER LES ÉVÉNÉMENTS SOUS FORME DE FICHIER CSV
 * 
 * 
 * 
 */
function downloadcsv(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
// Traitement du bouton Excel
document.getElementById("dwn-btn-csv").addEventListener("click", function(){
  // Appeler la fonction pour générer le fichier 
    // Generate download of hello.txt file with some content
    var text = document.getElementById("csv-val").value;

    var filename = "calendrier.csv";    
    downloadjson(filename, text);
}, false);