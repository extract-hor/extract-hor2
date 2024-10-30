/*
 * 
 * @function parseHoraire
 * @description  Parcourir et extraire toutes les périodes de l'horaire 
 * 
 * 
 * @returns {object} element   le text description des périodes 
 * 
 */

//variable globale pour le numéro de l'onglet 
var tabId = false;
//Constante pour le time zone  +5h
const TZ=5;

/*
 * @function setToOptions
 * @description  Transmettre le message vers la fenêtre option
 * @param {type} message
 * @returns {undefined}
 */
function sendToOptions(message){

            var optionsUrl = chrome.extension.getURL('/options/options.html');
            
           

            chrome.tabs.query({url: optionsUrl}, function(tabs) {
                if (tabs.length) {
                    chrome.tabs.update(tabs[0].id, {active: true});
                    //Envoyer un message sur l'onglet pour générer le fichier ics
                    chrome.tabs.sendMessage(tabs[0].id, {message: "updatetextzone",textzone:message}, function(response) {
                      });                    
                } else {
                    chrome.tabs.create({url: optionsUrl});
                }
            
            }); 
        }

        /*
 * 
 * @function parseHoraire
 * @description  Parcourir et extraire toutes les périodes de l'horaire 
 * 
 * 
 * @returns {object} element   le text description des périodes 
 * 
 */
//Parcourir tous les éléments de la classe
function parseHoraire() {
  var x, i, elements;
  x = document.querySelectorAll(".styletexte");
  for (i = 0; i < x.length; i++) {
    x[i].style.backgroundColor = "red";
    elements += x[i].textContent;
  }
  return elements;
}



/*
 * @function checkUrl
 * @description Recherche de patern dans l'url retoune vrai ou faux si trouvé ou pas
 * @param {tab} element est un objet onglet
 * @param {string} patern recherché dans l'url
 * @returns {int}  false si le patern n'est pas trouvé et tabid si le patern est présent dans l'url de l'onglet
 */
function checkUrl(element,patern){
    //Vérifie si c'est l'horaire enseignant
    if(element.url.includes(patern)){
        window.tabId = element.id; //Lire le id de l'onglet
        //mettre l'onglet en avant-plan
        chrome.tabs.get(window.tabId, function(tab) {
            chrome.tabs.highlight({'tabs': tab.index}, function() {});
            });
        //Sélectionner mettre a jour l'onglet   
        chrome.tabs.update(window.tabId, {selected: true});   
        //Enregistrer le numéro de l'onglet dans storage
        window.localStorage.setItem('tabId',window.tabId);
    }
}



/*
 * @function onError
 * @description  Affiche l'erreur sur le canal d'erreur
 * @param {type} error
 * @returns {undefined}
 */
function onError(error) {
  console.error(`Error: ${error}`);
}




/*
 * @function recherche_onglet
 * @description  fonction pour recherche l'onglet horaire enseignant
 * @param {type} patern
 * @returns {undefined}
 */
function recherche_onglet(patern){
    chrome.tabs.query({windowType:'normal'}, function(tabs) {
     tabs.forEach(element=>checkUrl(element,patern)); //parcourir chaque onglet 
    });
}





/*
 * @function makeid
 * @description Générer un UID unique pour chaque vevent dans le fichier ical
 * @param {type} length
 * @returns {String}
 */

    function makeid(length) {
       var result           = '';
       var characters       = 'ABCDEF0123456789';
       var charactersLength = characters.length;
       for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    }  

    
/*
 * @function zeroPadding
 * @description  Ajouter un 0 non significatif pour les heures ou mois selon besoin
 * @param {type} n
 * @returns {String}
 */    
    function zeroPadding(n){
        return (n<=9?n='0'+n:n); 
     }


/* @function dtstamp
 * @description  Generer un datestamp avec le format ical pour ajouter dans le vevent
 * 
 * @returns {String}  datetime formmaté
 */
    function dtstamp(){
        var d = new Date();
        var a = d.getFullYear();
        var m = zeroPadding(d.getMonth());
        var j = zeroPadding(d.getDay());
        var h = zeroPadding(d.getHours());
        var n = zeroPadding(d.getMinutes());
        var s = zeroPadding(d.getSeconds());
        var dt = +a+m+j+"T"+h+n+s;
        return dt;            
    }
    
    
	            
/* @function getDate
 * @description  formatter la chaine date avec le mois au bon endroit AAAA-XX-XX
 * @param {chaine de texte} d  AAAA-MM-JJ
 * @returns {String} sortie AAAA-MM-JJ
 */    
            
    function getDate(d){
        var day, month, year;

        result = d.match("[0-9]{2}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{4}");
        if(null != result) {
            dateSplitted = result[0].split(result[1]);
            day = dateSplitted[0];
            month = dateSplitted[1];
            year = dateSplitted[2];
        }
        result = d.match("[0-9]{4}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{2}");
        if(null != result) {
            dateSplitted = result[0].split(result[1]);
            day = dateSplitted[2];
            month = dateSplitted[1];
            year = dateSplitted[0];
        }

        if(month>12) {
            aux = day;
            day = month;
            month = aux;
        }
        return year + '-' + month +'-' + day;
    }
        
/*
 * @function getHreMinSec
 * @description  Formater une chaine heure et ajouter le 0 pour heure entre 0 et 9 X:XX
 * @param {type} chaine
 * @returns {String}  sortie HH:MM
 */
    function getHreMinSec(chaine){
        var hh = '';
        var tmp = chaine.split(':');
        if(parseInt(tmp[0]) <= 9)
            hh = '0'+tmp[0];
        else
            hh = tmp[0].toString();

        var mm = tmp[1];            
        return hh + ':' + mm + ':00';   
    }
        
/*
 * @function vcalstart
 * @description Ajouter l'entête du fichier ical avec la version et le nom du calendrier 
 * @returns {String} entête ical (format google pour compatibilité)
 */

    function vcalstart(){           
        var ical ="BEGIN:VCALENDAR\n";
        ical    +="PRODID:-//Google Inc//Google Calendar 70.9054//EN\n";    
        ical    +="VERSION:2.0\n"; 
        ical    +="CALSCALE:GREGORIAN\n";
        ical    +="METHOD:PUBLISH\n";
        ical    +="X-WR-CALNAME:Horaire-TOSCA.net\n";
        return ical;
    }
      


/* @function vcalstop
 * @description Ajouter le tag de fermeture du fichier ical
 * 
 * @returns {String}
 */

    function vcalstop(){
        return 'END:VCALENDAR\n';
    }

/*
 * @function vtimezone
 * @description Ajouter la chaine timezone
 * @returns {String}
 */
    function vtimezone(){
        var ical = "X-WR-TIMEZONE:America/Toronto\n"
        return ical;
    }

/*
 * @function vevent
 * @description Fonction principale pour creer une entrée vevent dans le fichier ical
 * @param {date-tiame} debut l'heure de début 
 * @param {date-time} fin  l'heure de fin
 * @param {string} titre  le titre de l'activité de l'événement
 * @param {string} description avec le titre de l'activité et local s'il y a lieu
 * @returns {string} vevent complet avec les paramètres formattés
 */
    function vevent(debut,fin,titre,description,local){
        var vevent  = '';
        var datedebut = '';
        var heuredebut = '';
        var heurefin = '';
        var a = debut.getFullYear().toString();
        var m = zeroPadding(debut.getMonth()+1).toString()
        var j = zeroPadding(debut.getDate()).toString();
        var h = zeroPadding(debut.getHours()).toString();
        var n = zeroPadding(debut.getMinutes()).toString();
        var s = zeroPadding(debut.getSeconds()).toString();
        var hf = zeroPadding(fin.getHours()).toString();
        var nf = zeroPadding(fin.getMinutes()).toString();
        var sf = zeroPadding(fin.getSeconds()).toString();            
        datedebut = a+m+j;
        heuredebut = h+n+s;
        heurefin = hf+nf+sf;

        vevent += '\n\n\nBEGIN:VEVENT\n';
        vevent += 'DTSTART:'+datedebut+'T'+heuredebut+'Z\n';
        vevent += 'DTEND:'+datedebut+'T'+heurefin+'Z\n';            
        vevent += 'DSTAMP:' +dtstamp()+'Z\n';
        vevent += 'UID:'+makeid(16)+'@localhost.com\n';            
        vevent += 'CLASS:PUBLIC\n';
        vevent += 'CREATED:'+dtstamp()+'Z\n';
        vevent += 'DESCRIPTION:'+description+'\n';
        vevent += 'LAST-MODIFIED:'+dtstamp()+'Z\n';
        vevent += 'LOCATION:'+local+'\n';            
        vevent += 'SEQUENCE:0\n';
        vevent += 'STATUS:CONFIRMED\n';
        vevent += 'SUMMARY:'+titre+'\n';            
        vevent += 'TRANSP:OPAQUE\n';            
        vevent += 'X-MICROSOFT-CDO-ALLDAYEVENT:FALSE\n';
        vevent += 'X-MICROSOFT-CDO-APPT-SEQUENCE:0\n';
        vevent += 'X-MICROSOFT-CDO-BUSYSTATUS:BUSY\n';
        vevent += 'X-MICROSOFT-CDO-IMPORTANCE:1\n';
        vevent += 'X-MICROSOFT-CDO-INSTTYPE:0\n';
        vevent += 'X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY\n';
        vevent += 'X-MICROSOFT-DISALLOW-COUNTER:FALSE\n';
        vevent += 'X-MICROSOFT-DONOTFORWARDMEETING:FALSE\n';
        vevent += 'END:VEVENT\n';
        return vevent;
    }
           




/*
 * @function generer_ici 
 * @description   Fonction principale pour convertir chaque bloc de texte en événement vevent
 * 
 * 
 * @param {chaine} tampon  Chaine de caractères avec un élément par ligne date/heuredebut/heurefin/activité/local
 * @returns {chaine} fichier iCalendar
 * 
 */

function generer_ics(tampon){
  
        
        //Compter le nombre de ligne
        var nbligne = tampon.split(/\r\n|\r|\n/).length;
        //Découper le message en ligne vers tampon
        tampon = tampon.split(/\r\n|\r|\n/);
        
        //Debut du fichier ical
        ical = vcalstart();       
        ical += vtimezone();
                           
        var decalage = window.localStorage.getItem('decala');        
                    
        var offset = parseInt(TZ) + parseInt(decalage);


       //Boucle principale de découpage du tampon pour créer les événements
       i=0;
       do{  
                    //Lire un élément du tableau
                    var item = tampon[i];
                    var regDate = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
                    var regHeure = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
                    var regChaine = /^[a-zA-Z0-9 ]*$/
                    //Vérifier le type
                    //  date
                    if(item.match(regDate)){
                        //console.log('C\'est une date !');
                    }
                    //  heure ou de fin
                    else if(item.match(regHeure)){
                        //console.log('C\'est une heure !');
                    }
                    else if(item.match(regChaine)){
                        //console.log('C\'est une chaine de texte !');
                    }
                   
                    
                    //DATE
                    var datedebut = getDate(tampon[i]);                    
                    i++;
                    //HEURE DE DÉBUT
                    var heuredebut = getHreMinSec(tampon[i]);
                    i++;
                    var dttmp = Date.parse(datedebut+' '+heuredebut)
                    var dtdebut = new Date(dttmp);  
                    dtdebut  = dtdebut.setHours(dtdebut.getHours()+offset);
                    dtdebut = new Date(dtdebut);
                    //HEURE DE FIN
                    var heurefin = getHreMinSec(tampon[i]);
                    i++;
                    var dtfin = new Date(datedebut+' '+heurefin);
                    dtfin  = dtfin.setHours(dtfin.getHours()+offset);
                    dtfin = new Date(dtfin);
                   
                    //TITRE DE L'ACTIVITÉ A L'HORAIRE
                    var titre = tampon[i];   
                    i++;
                    
                    //LE LOCAL OPTIONNEL
                    var local = (tampon[i]!='undefined'?tampon[i]:'');
                    i++;
                    
                    //VALIDATION SI LOCAL ALORS RECULER
                    var result = local.match(regDate);
                    if(null != result) {
                        local='';
                        i--;
                    }
                   
                        
                    var description = titre + '\n' + local + '\n';
                    
                    ical += vevent(dtdebut,dtfin,titre,description,local);
        }while(nbligne-4 > i);
        //Fin du fichier ical
        ical += vcalstop();
        
return ical;    
}





























































(function() {
  // Fonction pour ajouter le bouton
  const addButton = () => {
      // Cherche l'élément avec la classe 'TitrePage'
      const titrePage = document.querySelector(".TitrePage");
      
      if (titrePage) {
          // Crée un nouveau bouton
          const button = document.createElement("button");
          button.style.marginLeft = "10px"; // Ajoute une marge à gauche
          button.style.padding = "5px 10px"; // Ajuste le rembourrage du bouton

          // Crée une image pour l'icône
          const icon = document.createElement("img");
          icon.src = chrome.runtime.getURL("icons/horaire-48.png"); // Assure-toi que le chemin est correct
          icon.alt = "Icône Horaire"; // Texte alternatif pour l'image
          icon.style.width = "20px"; // Ajuste la taille de l'icône
          icon.style.height = "20px"; // Ajuste la taille de l'icône
          icon.style.marginRight = "5px"; // Ajoute une marge à droite

          // Ajoute l'icône au bouton
          button.appendChild(icon);
          button.appendChild(document.createTextNode("Extraire Horaire")); // Texte du bouton


/**
 * COEUR DU PROGRAMME 
 * 
 */
          // Ajoute un gestionnaire d'événements au bouton
          button.addEventListener("click", () => {
            //Opérations principale extraire l'horaire 
            //Sélectionner les tags de l'horaire et transmettre les données encodé par l'URL
            const elements = encodeURIComponent(JSON.stringify(parseHoraire()));
            
            //Trouvé l'url de la page option, ouvrir et poste les données par l'URL
            window.open(chrome.runtime.getURL('assets/options.html?data='+elements),'_blank');
            return false; //Empêche le refresh et la perte des données storage
          });






          // Ajoute le bouton à l'élément existant
          titrePage.appendChild(button);
      } else {
          console.error("Élément avec la classe 'TitrePage' non trouvé. Réessaie dans 100 ms...");
      }
  };

  // Démarre le processus
  addButton();
})();
