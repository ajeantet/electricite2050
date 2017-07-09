/*

Electricite2050 1.0 <http://www.electricite-2050.fr/>
Copyright (c) 2017 Adrien Jeantet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

   var Consommation = {
    nom: ['Industries', 'Résidentiel', 'Tertiaire', 'Transports', 'Agriculture'],
    details: ['Électricité utilisée dans les industries, comme la sidérurgie par exemple.', 'Électricité à la maison (chauffage, eau chaude, machines, ordinateurs,...)', "Électricité utilisée dans les hôpitaux, les écoles, les bureaux, les commerces, etc... pour le chauffage, l'éclairage, l'informatique, etc...", 'Électricité pour les trains et les voitures électriques', 'Électricité utilisée dns les exploitations agricoles (outils, machines)'],
    comment: ['Électricité utilisée dans les industries, comme la sidérurgie par exemple.', 'Électricité à la maison (chauffage, eau chaude, machines, ordinateurs,...)', "Électricité utilisée dans les hôpitaux, les écoles, les bureaux, les commerces, etc... pour le chauffage, l'éclairage, l'informatique, etc...", 'Électricité pour les trains et les voitures électriques', 'Électricité utilisée dns les exploitations agricoles (outils, machines)'],
    image: ['wp-content/uploads/2017/05/industries-1.svg', 'wp-content/uploads/2017/05/Residentiel.svg', 'wp-content/uploads/2017/05/Tertiaire.svg', 'wp-content/uploads/2017/05/transports-1.svg', 'wp-content/uploads/2017/05/Agriculture.svg'],
    valeur2015: [116.3, 150.1, 144.2, 8.1, 10.5], // http://www.statistiques.developpement-durable.gouv.fr/publications/p/2669/966/chiffres-cles-lenergie-edition-2016.html
    valeur2050: [116.3, 150.1, 144.2, 8.1, 10.5],
    unites: [1.16, 0.1, 16, 4, 0], //nbre de kWh par centrale/m2 de panneau solaire par personne/éolienne...
    unitext: ["% de baisse (Économies d'énergie, sobriété)", ' 000 logements rénovés par an', ' % des commerces et bureaux sont rennovés par an', ' % des voitures deviennent électriques', ""], //nbre de kWh par centrale/m2 de panneau solaire/éolienne...
    Max: [150, 200, 200, 160, 20],
    Min: [70, 70, 70, 5, 8],
  };

  var Production = {
    nom: ['Fossiles', 'Nucléaire', 'Hydraulique', 'Éolien', 'Solaire', 'Bioénergies'],
    details: ['Charbon, Pétrole et Gaz', 'Nucléaire (type EPR en 2050)', 'Barages hydraulique, marémotrices (type La Rance), houlomoteur (très expérimental)', 'Éoliennes terrestres et en mer', 'Panneaux photovoltaïques au sol ou sur les toits. Solaire à concentration', 'Biogaz, Bois, Recyclage des déchets ménagers, Géothermie', 'Besoins approximatifs en stockage (hors pilotabilité des autres sources) pour compenser la variabilité de la production'],
    image: ['wp-content/uploads/2017/05/Fossiles.svg', 'wp-content/uploads/2017/06/Nuclear-1.svg', 'wp-content/uploads/2017/05/Hydrau.svg', 'wp-content/uploads/2017/05/eolien.svg', 'wp-content/uploads/2017/05/solaire.svg', 'wp-content/uploads/2017/05/biomasse.svg', 'wp-content/uploads/2017/06/storage.svg'],
    colors: ["#434348", "#bf9df1", "#7cb5ec", "#f98af8", "#f8d334", "#90ed7d"],
    valeur2015: [34.4, 416.8, 53.3, 21.1, 7.4, 8.0], // Production nette https://opendata.rte-france.com/explore/dataset/prod_par_filiere/table/?sort=-annee 
    valeur2050: [34.4, 416.8, 53.3, 21.1, 7.4, 8.0],
    unites: [5, 21, 0, 0.01, 0.06 * 70000000 / 1000000, 0], //nbre de kWh par centrale/m2 de panneau solaire par personne/éolienne...
    unitext: [' centrales au gaz', ' centrales de nouvelle génération', 0, ' Éoliennes (dont 15% en mer)', " m² de panneaux solaires par personne", 0], //nbre de kWh par centrale/m2 de panneau solaire/éolienne...
    Max: [200, 600, 70, 310, 150, 50],
    Min: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    CO2: [450, 66, 13, 34, 50, 35, 0], // g/kWh    https://doi.org/10.1016/j.enpol.2013.10.048
    StorageFactor: [0, 0.13, 0.22, 0.73, 1.41, 0.08],
    StorageFactor2: [0, 0.05, 0.10, 0.29, 0.59, 0.03],
    Emplois: [110, 300, 110, 200, 280,210], //http://www.sfen.org/sites/default/files/public/atoms/files/bilan_emplois_de_la_transition_energetique_-_un_argument_a_manier_avec_precaution_-_sfen.pdf
    coût: [50, 80, 65, 55, 92, 100], //http://www.ademe.fr/sites/default/files/assets/documents/annexe_couts.pdf
    Investissement: [250, 570, 300, 1000, 975, 600],
  };

  var Scenarios = {
    v2015_conso: [116.3, 150.1, 144.2, 8.1, 10.5],
    v2015_prod: [30, 416.8, 59.1, 21.1, 7.4, 8.0],
    Ademe2050_conso: [87.2, 105.8, 119.5, 58.3, 10.8],
    Ademe2050_prod: [0, 0, 61, 302, 82, 34],
    NegaWatt2050_conso: [72.8, 74.7, 73.6, 150, 15.6],
    NegaWatt2050_prod: [0, 0, 67.8, 246.6, 147.2, 18],

  }

  var stockage = {
    rendement: 0.7,
    coût: 60,
    Emplois: 200,
    CO2: 50,
    Investissement:1000,
    STEP:5.8,
    nom: 'Stockage',
    details: ['Besoins approximatifs en stockage (hors pilotabilité des autres sources) pour compenser la variabilité de la production'],
    image: ['wp-content/uploads/2017/06/storage.svg'],
  }

  var Pertes_reseau = 0.08; //

