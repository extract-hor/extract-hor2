/*
 * 
 *   INITIALISATION DU GESTIONNAIRE DE MESSAGE
 *   OPTION PAGE
 * 
 */

// Récupérer et afficher les données de l'url
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
var icsContent = generateIcsFile(groupedEvents);
//Mettre la chaine avec les événements dans la zone de texte
document.getElementById('text-val').textContent = icsContent;







/*
*  Générer l'affichage dans le formulaire
*
*/
/*
async function generateAndDisplayIcs() {
    // ... votre code existant pour générer le fichier ics
  
    const tampon = await generateIcsFile(groupedEvents); // Attendre la génération du fichier
  
    const textzone = document.getElementById('text-val');
    textzone.textContent = tampon; // Utiliser textContent pour éviter les problèmes d'interprétation HTML
  }
  
  generateAndDisplayIcs();
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
      icsContent += `\nDTSTART;TZID=America/Montreal:${formatDateForIcal(event.dateEvenement)}T${formatHeureForIcal(event.heuredebut)}Z`;
      icsContent += `\nDTEND;TZID=America/Montreal:${formatDateForIcal(event.dateEvenement)}T${formatHeureForIcal(event.heurefin)}Z`;
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
  DTSTART;VALUE=DATE-TIME:${startDate}T${startTime}00Z
  DTEND;VALUE=DATE-TIME:${startDate}T${endTime}00Z
  SUMMARY:${summary}`;
  
    if (location) {
      iCalEvent += `\nLOCATION:${location}`;
    }
  
    iCalEvent += `
  END:VEVENT`;
  
    return iCalEvent;
  }






/*
 * TÉLÉCHARGER LES ÉVÉNÉMENTS SOUS FORME DE FICHIER ICS
 * 
 * 
 * 
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Start file download.
document.getElementById("dwn-btn").addEventListener("click", function(){
    // Generate download of hello.txt file with some content
    var text = document.getElementById("text-val").value;
    var filename = "calendrier.ics";
    
    download(filename, text);
}, false);












/**
 * Ajouter des 0 pour les nombres inférieur a 10
 * @param {*} digit 
 * @returns 
 */

function zeropadding(digit){
    if(digit<10){
        digit = '0' + digit;  
        }  

return digit;
}

/**
 * Tailler les éléments de dt ical
 * @param {*} icalStr 
 * @returns 
 */

function calenDate(icalStr)  {
    // icalStr = '20110914T184000Z'             
    var strYear = icalStr.substr(0,4);
    var strMonth = icalStr.substr(4,2);
    var strDay = icalStr.substr(6,2);
    var strHour = icalStr.substr(9,2);
    var strMin = icalStr.substr(11,2);
    var strSec = icalStr.substr(13,2);

    var oDate =  new Date(strYear,strMonth, strDay, strHour, strMin, strSec)

return oDate;
}


/**
 * Formatter le dt
 * @param {*} dtstr 
 * @param {*} str 
 * @param {*} decalage 
 * @returns 
 */

function updateDT(dtstr,str,decalage){
    
    const regexp = RegExp(dtstr,'g');
    
    let matches = str.matchAll(regexp);

    for (const match of matches) {
        

      
      var strPrefix = dtstr.length;

      
      
      var icalStr = str.slice(match['index'] + strPrefix , match['index'] + (strPrefix + 16));
     
      var oDate = calenDate(icalStr);      
      
      oDate.setHours(oDate.getHours() + decalage);     
      
      var icalStrRemplacement = oDate.getFullYear().toString() + zeropadding(oDate.getMonth()) + zeropadding(oDate.getDate()) + 'T' + zeropadding(oDate.getHours()) + zeropadding(oDate.getMinutes()) + '00' + 'Z';      
      
      str = str.replace(icalStr,icalStrRemplacement);
    }
return str;
}