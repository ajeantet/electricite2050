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


$(function() {


/* Définition de fonctions mathématiques */
  function sum(numbers) {
    var total = 0,
      i;
    for (i = 0; i < numbers.length; i += 1) {
      total += numbers[i];
    }
    return total;
  }

  function sum3(numbers) {
    var total = 0,
      i;
    for (i = 0; i < numbers.length; i += 1) {

      total += numbers[i] * numbers[i];

    }


    return Math.sqrt(total);
  }


  function multiply(A1, A2) {
    var Product = [];
    for (var i = 0; i < A1.length; i++) {
      Product[i] = A1[i] * A2[i];
    }

    return Product;

  }

/* Générer le graph consommation */
  function Conso_Chart(Consommation) {

    return {
      chart: {
        renderTo: 'Consommation_Chart',
        animation: false
      },

      title: {
        text: 'Consommation Électrique Française' // Titre
      },

      // Adapter l'étiquette de chaque colonne en fonction des actions de l'utilisateur 
      tooltip: {
        formatter: function() {
          var index = this.colorIndex; //récupérer le numéro de colonne
          var Stack = this.series.options.stack; //récupérer la pile (2015 ou 2050)
          tempp2 = '<b>' + this.x + ' en ' + Stack + ': ' + this.y + ' TWh'; // Valeur en "année" : X TWh

          if (Stack == 2015) {
            // Pour 2015 on s'arrête là
            return tempp2 + '</b>';
          } else {
            // Pour 2050
            tempp2 += ' ' + comp(this.y, Consommation.valeur2015[index]) + '</b>'; // Comparaison à 2015
            if (this.y >= Consommation.valeur2015[index]) {
              if (index == 3) {
		// Cas particulier des transports : on ne commente qu'en cas d'augmentation
                tempp2 += '<br /><span style="color:#216be7">' + parseInt((this.y - Consommation.valeur2015[index]) / Consommation.unites[index]) + Consommation.unitext[index] + '</span>';
              }

            } else if (index == 3 || index == 4) {} else {
              // En cas de diminution, pas de commentaire pour les transports et l'agriculture
              tempp2 += '<br /><span style="color:#216be7">' + parseInt((Consommation.valeur2015[index] - this.y) / Consommation.unites[index]) + Consommation.unitext[index] + '</span>';
            }
	    // Pour les autres on indique la limite réaliste
            if (this.y < 1.03 * Consommation.Min[index] || this.y > 0.97 * Consommation.Max[index]) {
              tempp2 += '<br /><span style="color:red">Vous avez atteint la limite réaliste !</span>';
            } else if (this.y < 1.25 * Consommation.Min[index] || this.y > 0.8 * Consommation.Max[index]) {
              tempp2 += '<br /><span style="color:orange">Vous être proche de la limite réaliste !</span>';
            }
            return tempp2;
          }
        }
      },


      xAxis: {
        categories: Consommation.nom,
        labels: {
          enabled: true,
          useHTML: true,
          formatter: function() {
      	    // label sur l'axe x avec vignette. Le lien iframe est ajouté par une fonction spécifique (via l'id)
            return '<div class="label_wrapper" id="' + this.value + '" title="' + Consommation.details[Consommation.nom.indexOf(this.value)] + '" ><img align="right;" class="icon" src="http://www.energie-2050.fr/' + Consommation.image[Consommation.nom.indexOf(this.value)] + '"   /><br />' + this.value + '</div>';
          }

        }
      },

      yAxis: [{
        title: {
          text: 'Consommation (TWh)'
        },
        stackLabels: {
          enabled: true,
          crop: false,
          overflow: 'none',
          style: {
            fontWeight: 'bold',
            color: 'gray'
          },
          formatter: function() {
            return this.stack; // afficher 2015 ou 2050 au dessus de la colonne
          }
        }
      }],

      // En dessous d'une certaine taille d'écran, faire pivoter la mention 2015/2050
      responsive: {
        rules: [{
          condition: {
            maxWidth: 550
          },
          chartOptions: {
            yAxis: [{ //--- Primary yAxis
              title: {
                text: 'Consommation (TWh)'
              },
              stackLabels: {
                enabled: true,
                rotation: -90,
                crop: false,
                overflow: 'none',
                marginBottom: 10,
                marginLeft: 3,
                x: 3,
                y: -20,

                style: {
                  fontWeight: 'bold',
                  color: 'gray',

                },
                formatter: function() {
                  return this.stack;
                }
              }
            }],
          }
        }]

      },

      plotOptions: {
        series: {
          point: {
            events: {

              drag: function(e) {
                if (e.y > Consommation.Max[this.index] || e.y < Consommation.Min[this.index]) {
                  //bloquer le drag'n'drop au limites réalistes et mettre à jour
		  if (e.y > Consommation.Max[this.index]){
                    Consommation.valeur2050[this.index] = Consommation.Max[this.index];
		  } else {
		    Consommation.valeur2050[this.index] = Consommation.Min[this.index];
		  }
                  Consommation_Pie.series[0].update({
                    data: PieTrace(Consommation)
                  });
                  Consommation_Pie.setTitle({
                    text: 'Répartition de la consommation en 2050 (Total ' + parseInt(sum(Consommation.valeur2050)) + ' TWh/an)'
                  }); //mise à jour du titre du camembert consommation.
                  Update(0);
                  return false;
                }
                Consommation.valeur2050[this.index] = e.y,

                  $('#drag').html() //??? depracated ???
              },

              drop: function(e) {
		// comportement standard lors d'un changement de valeur => mise à jour des graphs
                $('#drop').html(
                  Consommation.valeur2050[this.index] = e.y,
                  Consommation_Pie.series[0].update({
                    data: PieTrace(Consommation)
                  }),
                  Consommation_Pie.setTitle({
                    text: 'Répartition de la consommation en 2050 (Total ' + parseInt(sum(Consommation.valeur2050)) + ' TWh/an)'
                  }),
                  Update(0),
                )
              }

            }
          },
          stickyTracking: false //??? depracated ???
        },
        column: {
          stacking: 'normal' //colonnes sous forme de piles 2015/2050
        },
        line: {
          cursor: 'ns-resize',
          'stroke-width': 10,

        }
      },

      credits: {
        enabled: false
      },

      // valeurs du graph
      series: [{
        name: 'Consommation 2015',
        data: Consommation.valeur2015.slice(0, 5),
        color: Highcharts.getOptions().colors[0],
        type: 'column',
        minPointLength: 1,
        colorByPoint: true,
        stack: '2015',
        showInLegend: false,
        comment: '',
      }, {
        name: 'Consommation 2050',
        data: Consommation.valeur2050.slice(0, 5),
        type: 'column',
        minPointLength: 1,
        colorByPoint: true,
        draggableY: true, //ajustable par l'utilisateur
        dragPrecisionY: 1,
        stack: '2050',
        showInLegend: false,
        comment: Consommation.comment, //??? commentaire au survol
      }, ]
    };
  };

/* Générer un camembert (pour la consommation et la production */
  function PieTrace(Data) {
    tempo = [];
    for (i = 0; i < Data.nom.length; i += 1) {

// Montrer les labels pour des valeurs non nulles, montrer en dehors du graph pour les petites valeurs
      if (Data.valeur2050[i] / sum(Data.valeur2050) < 0.01) {
        tempo[i] = {
          "name": Data.nom[i],
          "y": Data.valeur2050[i],
          "dataLabels": {
            enabled: false,
            distance: 0
          }
        };
      } else if (Data.valeur2050[i] / sum(Data.valeur2050) < 0.05) {
        tempo[i] = {
          "name": Data.nom[i],
          "y": Data.valeur2050[i],
          "dataLabels": {

            distance: 8
          }
        };
      } else {
        tempo[i] = {
          "name": Data.nom[i],
          "y": Data.valeur2050[i],
          "dataLabels": {
            distance: -25
          }
        };
      };

    }

    return tempo;
  }


/* Générer le graph production - la structure est largement similaire à celle du graph consommation */
  function Produ_Chart(Production) {

    return {

      chart: {
        renderTo: 'Production_Chart',
        animation: false
      },

      title: {
        text: 'Production Électrique Française'
      },

      // Adapter l'étiquette de chaque colonne en fonction des actions de l'utilisateur 
      tooltip: {
        formatter: function() {
          var index = this.colorIndex;
          var Stack = this.series.options.stack;
          tempp = '<b>' + this.x + ' en ' + Stack + ': ' + this.y + ' TWh';

          if (Stack == 2015) {

            return tempp + '</b>';
          } else {

            tempp += ' ' + comp(this.y, Production.valeur2015[index]) + '</b>';
            if (index == 2 || index == 5) {} else {
              tempp += '<br /><span style="color:#216be7">' + parseInt(this.y / Production.unites[index]) + Production.unitext[index] + '</span>'; //+this.series.options.comment[index];
            }
            if (this.y > 0.97 * Production.Max[index]) {
              tempp += '<br /><span style="color:red">Vous avez atteint la limite réaliste !</span>';
            } else if (this.y > 0.8 * Production.Max[index]) {
              tempp += '<br /><span style="color:orange">Vous être proche de la limite réaliste !</span>';
            }
            return tempp;
          }
        }

      },
      // label sur l'axe x avec vignette. Le lien iframe est ajouté par une fonction spécifique (via l'id)
      xAxis: {
        categories: Production.nom,
        labels: {
          enabled: true,
          useHTML: true,
          formatter: function() {
            return '<div class="label_wrapper" align="center;" style="text-align:center;" title="' + Production.details[Production.nom.indexOf(this.value)] + '" id="' + this.value + '"><img align="right;" class="icon" src="http://www.energie-2050.fr/' + Production.image[Production.nom.indexOf(this.value)] + '"  /><br />' + this.value + '</div>';
          }

        }
      },

      yAxis: [{
        title: {
          text: 'Production (TWh)'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: 'gray'
          },
          formatter: function() {
            return this.stack; // afficher 2015/2050 au dessus des colonnes
          }
        },

      }],
      // En dessous d'une certaine taille d'écran, faire pivoter la mention 2015/2050
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            yAxis: [{ //--- Primary yAxis
              title: {
                text: 'Consommation (TWh)'
              },
              stackLabels: {
                enabled: true,
                rotation: -90,
                crop: false,
                overflow: 'none',
                x: 3,
                y: -20,
                style: {
                  fontWeight: 'bold',
                  color: 'gray',
                },
                formatter: function() {
                  return this.stack;
                }
              }
            }],
          }
        }]

      },

      plotOptions: {
        series: {
          point: {
            events: {

              drag: function(e2) {
                //bloquer le drag'n'drop au limites réalistes et mettre à jour
                if (e2.y > Production.Max[this.index]) {
                  Production.valeur2050[this.index] = Production.Max[this.index];
                  Production_Chart.series[1].data[this.index].update(y = Production.Max[this.index]),
                    Production_Pie.series[0].update({
                      data: PieTrace(Production)
                    }),
                    Update(0);
                  return false;
                }

                if (e2.y < 0) {
                  Production.valeur2050[this.index] = Production.Min[this.index];
                  Production_Chart.series[1].data[this.index].update(y = Production.Min[this.index]),
                    Production_Pie.series[0].update({
                      data: PieTrace(Production)
                    }),
                  Update(0);
                  return false;
                }

                $('#drag').html()

              },

              drop: function(e2) {
		// Comportement normal en cas de changement de la valeur
                $('#drop').html(

                  Production.valeur2050[this.index] = e2.y,
                  Production_Pie.series[0].update({
                    data: PieTrace(Production)
                  }),
                  Update(0),
                )
              }

            }
          },
          stickyTracking: false
        },

        column: {
          stacking: 'normal',
          StackLabels: {
            enabled: true,
            useHTML: true,
            verticalAlign: 'bottom' // ??? 
          }
        },
        line: {
          cursor: 'move'
        }
      },
      credits: {
        enabled: false
      },
      //Mise en place des séries de valeurs
      series: [{
        name: 'Production 2015',
        data: Production.valeur2015.slice(0, 6),
        color: Highcharts.getOptions().colors[0],
        type: 'column',
        minPointLength: 1,
        colorByPoint: true,
        stack: '2015',
        colors: Production.colors,
        showInLegend: false,
      }, {
        name: 'Production 2050',
        data: Production.valeur2050.slice(0, 6),
        type: 'column',
        minPointLength: 1,
        colorByPoint: true,
        draggableY: true,
        dragPrecisionY: 1,
        stack: '2050',
        colors: Production.colors,
        showInLegend: false,
      }, ],


    };

  }




/* La fonction Bilan calcule toutes les grandeurs sous-jacentes aux résultats */
  function Bilan(Consommation, Production) {
    totalProd = [sum(Production.valeur2015), sum(Production.valeur2050)], // Prodution toatle (hors destockage)
      Flexi = [Production.valeur2015[0] + Production.valeur2015[2] * 0.28, Production.valeur2050[0] + Production.valeur2050[2] * 0.28], //Production flexible (fossiles+hydraulique de lacs)
      Fatale = [Production.valeur2015[3] + Production.valeur2015[4] + Production.valeur2015[2] * 0.72, Production.valeur2050[3] + Production.valeur2050[4] + Production.valeur2050[2] * 0.72], //éolien, solaire, hydraulique au fil de l'eau
      Cste = [totalProd[0] - Flexi[0] - Fatale[0], totalProd[1] - Flexi[1] - Fatale[1]], //vérification que rien n'a été oublié
      ConsoFlex = [0, (Consommation.valeur2050[3] - 8) * 0.3], // Consommation flexible : une partie des transports électrifiés
      // Calcul du stockage à partir des valeurs de production et du coefficient "StorageFactor". Le solaire et l'éolien sont ajoutés quadratiquement, la production et la consommation flexible ssont retranchées, ainsi que le stockage hydraulique déjà existant (5.8 TWh).
      Temping = multiply(Production.valeur2050, Production.StorageFactor2), 
      stock = [0, Math.max(sum(Temping.slice(0, 3)) + sum3(Temping.slice(3, 5)) + Temping[5] - Flexi[1] * 0.7 - 5.8 - ConsoFlex[1], 0)],
      Pompage = [5.8/0.85, 5.8/0.85], //pompage pour les STEP (efficacité 85%)
      NewStock = [0, stock[1] * (1/stockage.rendement)], //Besoins de stockage en prenant en compte le rendement
      Destockage = [0, stock[1]], //Électricité fournie en destcokant
      Pertes = [(totalProd[0] + 5.8) * Pertes_reseau, (totalProd[1] + stock[1] + 5.8) * Pertes_reseau], // Pertes sur le réseau (production totale + destockage fois pertes)
      totalConso = [sum(Consommation.valeur2015), sum(Consommation.valeur2050)], // Consommation totale
      Export = [totalProd[0] - Pertes[0] - Pompage[0] - NewStock[0] + Destockage[0] + 5.8 - totalConso[0], totalProd[1] - Pertes[1] - Pompage[1] - NewStock[1] + Destockage[1] + 5.8 - totalConso[1]], //Les excédents (resp. manques) sont exportés (resp. importés)
      Besoins = [0, totalConso[1] + Pertes[1] + Pompage[1] + NewStock[1] - Destockage[1] - 5.8], //Besoins simplifiés à afficher dans la jauge = Consommation + énergie à stocker - énergie à déstocker

      // calcul d'un indicateur de réalisme
      Reali = 0;
    // réalisme des économies d'énergie
    for (var i = 0; i < Consommation.valeur2050.length; i++) {
      if (Consommation.valeur2050[i] > 0.95 * Consommation.Max[i]) {
        Reali = Reali + 3;
      } else if (Consommation.valeur2050[i] > 0.9 * Consommation.Max[i]) {
        Reali = Reali + 2;
      } else if (Consommation.valeur2050[i] > 0.8 * Consommation.Max[i]) {
        Reali = Reali + 1;
      }
    }
    //Réalisme des productions
    for (var i = 0; i < Production.valeur2050.length; i++) {

      if (Production.valeur2050[i] > 0.95 * Production.Max[i]) {
        Reali = Reali + 3;
      } else if (Production.valeur2050[i] > 0.9 * Production.Max[i]) {
        Reali = Reali + 2;
      } else if (Production.valeur2050[i] > 0.8 * Production.Max[i]) {
        Reali = Reali + 1;
      }

    }
    // Malus en cas d'imports/exports excessifs
    if (Export[1] < 0) {
      Reali = Reali - Export[1] / 3;
    } else if (Export[1] > 60) {
      Reali = Reali + (Export[1] - 60) / 6;
    }


    //On range les valeurs dans un tableau, avec un arrondi au dizième
    temp2 = {
      nom: ['Total Production', 'Pertes', 'Consommation', 'Exportations'], //??? deprcated ???
      valeur2015: [
        totalProd[0],
        parseInt(Pertes[0]),
        totalConso[0],
        parseInt(Export[0] * 10) / 10,
        parseInt(Pompage[0] * 10) / 10,
        parseInt(Destockage[0] * 10) / 10,
        parseInt(Flexi[0] * 10) / 10,
        parseInt(Fatale[0] * 10) / 10,
        parseInt(Cste[0] * 10) / 10,
        parseInt(Besoins[0]),
        parseInt(ConsoFlex[0]),
        parseInt(stock[0]),
      ],
      valeur2050: [
        totalProd[1],
        parseInt(Pertes[1]),
        totalConso[1],
        parseInt(Export[1] * 10) / 10,
        parseInt(Pompage[1] * 10) / 10,
        parseInt(Destockage[1] * 10) / 10,
        parseInt(Flexi[1] * 10) / 10,
        parseInt(Fatale[1] * 10) / 10,
        parseInt(Cste[1] * 10) / 10,
        parseInt(NewStock[1] * 10) / 10,
        parseInt(Besoins[1]),
        parseInt(ConsoFlex[1] * 10) / 10,
        parseInt(stock[1]),
      ],
      CO2: parseInt((sum(multiply(Production.valeur2050, Production.CO2)) + stock[1] * stockage.CO2)/1000), //Cacul des rejets de CO2
      Emplois: parseInt((sum(multiply(Production.valeur2050, Production.Emplois)) + stock[1] * stockage.Emplois)/1000)*1000, // Nombre d'emploi nécessaires
      coût: parseInt((sum(multiply(Production.valeur2050, Production.coût)) + stock[1] * stockage.CO2)/totalProd[1])/1000, //Coût du kW
      Investissement: parseInt((sum(multiply(Production.valeur2050, Production.Investissement)) + stock[1] * stockage.Investissement + (totalConso[0] - totalConso[1] + Consommation.valeur2050[3]) * 250 + Consommation.valeur2050[3]*500)/30/1000), // Investissements nécessaires sur 30 ans en prenant en compte les économies d'énergie
    };
    return BilanV = temp2;

  }

/* Tracer le Bilan Production vs. Consommation */
  function PlotBilan(Bilan) {
    return [{
      name: 'Destockage Autres',
      data: [0],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#97d881",
    }, {
      name: 'Destockage Hydro',
      data: [5.8],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: Highcharts.getOptions().colors[0],
    }, {
      name: 'Production flexible',
      data: [BilanV.valeur2015.slice(6, 7)],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#6B8ECB",
    }, {
      name: 'Production fatale',
      data: [BilanV.valeur2015.slice(7, 8)],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#046380",
    }, {
      name: 'Production peu variable',
      data: [BilanV.valeur2015.slice(8, 9)],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#4065A4",
    }, {
      name: 'Exportations',
      data: BilanV.valeur2015.slice(3, 4),
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: 'red',
    }, {
      name: 'Pertes réseau',
      data: BilanV.valeur2015.slice(1, 2),
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: Highcharts.getOptions().colors[1],
    }, {
      name: 'Stockage Supplémentaire',
      data: [0],
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: '#97d881',
    }, {
      name: 'Pompage Hydo',
      data: BilanV.valeur2015.slice(4, 5),
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: Highcharts.getOptions().colors[0],
    }, {
      name: 'Consommation Flexible',
      data: BilanV.valeur2015.slice(11, 12),
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: "#be9f72",
    }, {
      name: 'Consommation',
      data: BilanV.valeur2015.slice(2, 3),
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: "#BD8D46",
    }, {
      name: 'Destockage Autres',
      data: [0, BilanV.valeur2050.slice(5, 6)],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#97d881",
    }, {
      name: 'Destockage Hydro',
      data: [0, 5.8],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: Highcharts.getOptions().colors[0],
    }, {
      name: 'Production flexible',
      data: [0, BilanV.valeur2050.slice(6, 7)],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#6B8ECB",
    }, {
      name: 'Production fatale',
      data: [0, BilanV.valeur2050.slice(7, 8)],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#046380",
    }, {
      name: 'Production peu variable',
      data: [0, BilanV.valeur2050.slice(8, 9)],
      showInLegend: false,
      type: 'bar',
      stack: 'Production',
      color: "#4065A4",
    }, {
      name: 'Exportations',
      data: [0, BilanV.valeur2050.slice(3, 4)],
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: 'red',
    }, {
      name: 'Pertes réseau',
      data: [0, BilanV.valeur2050.slice(1, 2)],
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: Highcharts.getOptions().colors[1],
    }, {
      name: 'Stockage Supplémentaire',
      data: [0, BilanV.valeur2050.slice(9, 10)],
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: '#97d881',
    }, {
      name: 'Pompage Hydro',
      data: [0, BilanV.valeur2050.slice(4, 5)],
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: Highcharts.getOptions().colors[0],
    }, {
      name: 'Consommation Flexible',
      data: [0, BilanV.valeur2050.slice(11, 12)],
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: "#be9f72",
    }, {
      name: 'Consommation',
      data: [0, parseInt((BilanV.valeur2050.slice(2, 3) - BilanV.valeur2050.slice(11, 12)) * 10) / 10],
      showInLegend: false,
      type: 'bar',
      stack: 'Consommation',
      color: "#BD8D46",
    }];

  }


/* Titre de la jauge production vs consommation */
  function jauge_title() {

    A = BilanV.valeur2050[0]; // production totale
    B = BilanV.valeur2050[10]; // Besoins

    if (A > 1.15 * B) {
      return {
        title: {
          text: 'Surproduction !',
          style: {
            color: 'orange',
            "fontWeight": "bold",
            "fontSize": "13px",
          }
        }
      };

    } else if (A > B && A < 1.15 * B) {
      return {
        title: {
          text: 'Production suffisante',
          style: {
            color: 'green',
            "fontWeight": "bold",
            "fontSize": "13px",
          }
        }
      };
    } else if (A > 0.95 * B && A < B) {
      return {
        title: {
          text: 'Production faible !',
          style: {
            color: 'orange',
            "fontWeight": "bold",
            "fontSize": "13px",
          }
        }
      };

    } else if (A < 0.95 * B) {
      return {
        title: {
          text: 'Production insuffisante !',
          style: {
            color: 'red',
            "fontWeight": "bold",
            "fontSize": "13px",
          }
        }
      };

    }

  }

/* Mise en place de la jauge production vs consommation */
  function Produ_jauge() {
    return {
      chart: {
        type: 'solidgauge',
        renderTo: 'Production_jauge',
        backgroundColor: null,
      },

      title: null,

      // Positionnement dans son div
      pane: {
        center: ['50%', '43%'],
        size: '70%',
        startAngle: -90,
        endAngle: 90,
        background: {
          backgroundColor: null,
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'solid'
        }
      },

      tooltip: {
        enabled: false
      },

      // valeurs limites
      yAxis: {
        stops: [
          [0.9, '#DF5353'], //rouge
          [0.95, '#ee9e05'], //orange
          [1, '#55BF3B'], // vert
          [1.15, '#55BF3B'], // vert
          [1.2, '#ee9e05'], // orange
        ],
        lineWidth: 0,
        minorTickInterval: null,
        tickAmount: 0,
        labels: {

          enabled: false
        },
        tickInterval: (parseInt(BilanV.valeur2050[10])/1000), // Très important, le max doit être un multiple du nombre d'intervalles
        min: 0,
        max: parseInt(BilanV.valeur2050[10]),
        // valeurs de départ
        title: {
          text: 'Production suffisante !',
          y: -30,
          style: {
            color: 'green',
            "fontWeight": "bold",
            "fontSize": "13px",
          }

        }
      },

      plotOptions: {
        solidgauge: {
          dataLabels: {
            borderWidth: 0,
            useHTML: true
          }
        }
      },

      credits: {
        enabled: false
      },

      // valeur et commentaires de départ
      series: [{
        type: 'solidgauge',
        name: 'Production',
        data: [parseInt(BilanV.valeur2050[0])],
        dataLabels: {
          format: '<div style="text-align:left;">' +
            '<span class="jauge_text_2">Production : {y} TWh <br />Conso + Pertes :  ' + parseInt(BilanV.valeur2050[10]) + ' TWh</span><span class="jauge_text_1"><br />' + expimp() + ' :  ' + Math.abs(parseInt(BilanV.valeur2050[3])) + ' TWh</span></div>'
        },
        tooltip: {
          valueSuffix: ' TWh'
        }
      }]

    };

  }

/* Mise en place de la fonction stockage */
  function Stock_Col(Production) {

    return {

      chart: {
        renderTo: 'Stock_Chart',
        animation: true,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
      },

      title: {
        text: 'Stockage en 2050'
      },

      //text de la bulle au survol
      tooltip: {
        formatter: function() {
          tempp = '<b> ' + this.series.name + ' : ' + this.y + ' TWh';
          return tempp;

        }

      },
      //légende sur l'axe x (même format que pour la conso et la production)
      xAxis: {
        categories: Production.nom,
        labels: {
          enabled: true,
          useHTML: true,
          formatter: function() {
            return '<div class="label_wrapper" align="center;" style="text-align:center;" title="' + stockage.details + '" id="stocklab"><img align="right;" class="icon" src="http://www.energie-2050.fr/' + stockage.image + '"  /><br />' + stockage.nom + '</div>';
          }

        }
      },

      yAxis: [{
        labels: {
          enabled: false
        },
        title: {
          text: null
        },
        gridLineWidth: 0,
        min: 0,
        max: 200, //on fixe les bornes

      }],

      plotOptions: {

        column: {
          stacking: 'normal',
          StackLabels: {
            enabled: true,
            useHTML: true,
            verticalAlign: 'bottom'
          }
        },
        line: {
          cursor: 'move'
        }
      },

      credits: {
        enabled: false
      },
      // Mise en place des valeurs et couleurs
      series: [{
        name: 'Nouvelles formes de stockage',
        data: [BilanV.valeur2050[12]],
        color: '#97d881',
        type: 'column',
        showInLegend: false,
      }, {
        name: 'Stockage Hydro-électrique',
        data: [stockage.STEP],
        color: Highcharts.getOptions().colors[0],
        type: 'column',
        showInLegend: false,
      }],


    };

  }

/* Tuiles à afficher dans les résultats */
  function tile2(color, img, texte1, texte2, description, texte3, id) {

    return '<div class="box" style="background: none repeat scroll 0 0 ' + color + '" title="' + description + '" id="' + id + '"><img alt="" src=http://www.electricite-2050.fr/' + img + '><br /><h1>' + texte1 + '</h1><p>' + texte2 + ' </p><p>' + texte3 + '</p></div>';


  }

/* Comparer deux valeurs et renvoyer la hausse/baisse en % ou en x */
  function comp(A, B) {
    if (A > B) {
      if (A > 2 * B) {
        temp = "x " + parseInt(A / B * 10) / 10;
      } else {
        temp = "+ " + parseInt(100 * (A / B - 1)) + " %";
      }
    } else if (A < B) {
      temp = parseInt(100 * (A / B - 1)) + " %";
    } else {
      temp = "inchangé";

    }
    return "(" + temp + ")";
  }


/* Graphs différents selon les valeurs */
  function updown(x, y) { // Consommation (augmente ou baisse)
    if (x < y) {
      return "wp-content/uploads/2017/06/consommation_down.svg";
    } else {
      return "wp-content/uploads/2017/06/consommation_up.svg";
    }

  }

  function updown2(x) { // Exportations ou importations
    if (x < 0) { 
      return "wp-content/uploads/2017/06/Import-2.svg";
    } else {
      return "wp-content/uploads/2017/06/Export-3.svg";
    }

  }

  function realisme() { // Réalisme du modèle
    if (Reali > 10) {
      t1 = "#f35d28",
        t2 = "wp-content/uploads/2017/06/unsmile.svg",
        t3 = "Au travail !"
      t4 = "Votre modèle n'est pas réaliste !"
    } else if (Reali > 5) {
      t1 = "#f39f28",
        t2 = "wp-content/uploads/2017/06/hardsmile.svg",
        t3 = "Difficle !"
      t4 = "Il faudra beaucoup de volonté pour réaliser ce modèle !"
    } else if (Reali > 3) {
      t1 = "#fbd85e",
        t2 = "wp-content/uploads/2017/06/smile.svg",
        t3 = "Bien !"
      t4 = "Votre modèle semble réalisable !"
    } else {
      t1 = "#9eeb65",
        t2 = "wp-content/uploads/2017/06/bigsmile.svg",
        t3 = "Bravo !"
      t4 = "Votre modèle est réaliste !"

    }

    return tile2(t1, t2, t3, t4, "Estimation de réalisme", "", 'reali');

  }

/* calcul des résultats, génération des tuiles */
  function resultats() {
    return "<div class='containerResults'>" + realisme() +
      tile2("#cecece", updown(BilanV.valeur2050[2], BilanV.valeur2015[2]), parseInt(BilanV.valeur2050[2]) + " TWh/an", "Consommation", "Consommation d'électricité nette annuelle", comp(parseInt(BilanV.valeur2050[2]), parseInt(BilanV.valeur2015[2])), 'conso') +
      tile2(Highcharts.getOptions().colors[0], "wp-content/uploads/2017/06/renouvelable_w-4.svg", parseInt(100 * sum(Production.valeur2050.slice(2, 6)) / sum(Production.valeur2050.slice(0, 6))) + " %", "renouvelable", "Proportions de renouvelables dans la production d'électricité", "(16% aujourd'hui)", 'enr') +
      tile2(Production.colors[1], "wp-content/uploads/2017/06/Nuclear_w-1.svg", parseInt(Production.valeur2050[1] / Production.unites[1]), "centrales", "Centrales nucléaires type EPR (plusieurs réacteurs par centrale)", "(19 aujourd'hui)", 'nucleaire') +
      tile2(Production.colors[3], "wp-content/uploads/2017/05/eolien_w.svg", parseInt(Production.valeur2050[3] / Production.unites[3]), "Éoliennes", "description", comp(parseInt(Production.valeur2050[3]), parseInt(Production.valeur2015[3])), 'eolien') +
      tile2(Production.colors[4], "wp-content/uploads/2017/06/solaire_w.svg", parseInt(Production.valeur2050[4] / Production.unites[4]) + " m²", "de solaire par personne", "Surface recouverte par des panneaux photovoltaïques en prenant 0.05TWh/an/km²", "(" + parseInt(Production.valeur2050[4] / 0.06 / 550000 * 100 * 100) / 100 + "% du territoire)", 'solaire') +
      tile2('#abe2f6', "wp-content/uploads/2017/06/CO2_w-1.svg", BilanV.CO2 + " MtCO2/an", "MégaTonnes de C02/an", "Rejets annuels de CO2 liés à la production de CO2 (en annalyse de cycle de vie)", comp(BilanV.CO2, 45), 'co2') +
      tile2(Highcharts.getOptions().colors[3], "wp-content/uploads/2017/06/emploi_w.svg", BilanV.Emplois, "Emplois/an", "Rejets annuels de CO2 liés à la production de CO2 (en annalyse de cycle de vie)", comp(BilanV.Emplois, 130000), 'emploi') +
      tile2("#8ed33d", "wp-content/uploads/2017/06/cout_w.svg", BilanV.coût, "Euros/kWh", "Coût de production de l'électricité (en analyse de cycle de vie)", comp(BilanV.coût, 0.06), 'cout') +
      tile2("#d6ab85", "wp-content/uploads/2017/06/investissement.svg", BilanV.Investissement + " Md€/an", "Milliards d'euros par an", "Investissements nécessaires pour votre programme sur 30 ans", "d'investissement", 'investissement') +
      tile2("#f2b1b1", updown2(parseInt(BilanV.valeur2050[3])), Math.abs(parseInt(BilanV.valeur2050[3])) + " TWh/an", expimp(), "Exportations/Importations nettes (échanges avec les pays voisins)", "(" + parseInt(100 * Math.abs(BilanV.valeur2050[3]) / BilanV.valeur2050[0]) + " % de la production)", 'export') +
      tile2("#a4eede", "wp-content/uploads/2017/06/elec-1.svg", parseInt(23 + 100 * Consommation.valeur2050[3] / 1800) + "%", "Part de l'électricité dans", "Pour réaliser la transition énergétique, il faut aussi s'aoccuper des transports et du chauffage !", "le mix énergétique", 'elec') +
      '</div>'


  }



/* Mise à jour des diférends graphs */
  function Update(N) {

    // Mise à jour des graphs principaux, uniquement lorsqu'il y a des paramètres dans l'URL
    if (N == 1) {
      Consommation_Chart = new Highcharts.Chart(Conso_Chart(Consommation));
      Production_Chart = new Highcharts.Chart(Produ_Chart(Production));
      Consommation_Pie.series[0].update({
        data: PieTrace(Consommation)
      });
      Production_Pie.series[0].update({
        data: PieTrace(Production)
      });
    }

    // Mise à jour du Bilan, de la jauge de production et des résultats
    Bilan(Consommation, Production); //calcul
    Bilan_Chart.update({
      series: PlotBilan(BilanV)
    }); //mise à jour du graph Bilan
    Production_jauge.yAxis[0].update({
      tickInterval: parseInt(BilanV.valeur2050[10]) / 1000,
      max: parseInt(BilanV.valeur2050[10]),

    }); //ajustement des bornes de la jauge (par rapport aux besoins)
    Production_jauge.yAxis[0].update(jauge_title());//mise à jour du titre de la jauge
    Production_jauge.series[0].points[0].update(parseInt(BilanV.valeur2050[0])); //mise à jour de sa valeur
    Production_jauge.series[0].update({
      dataLabels: {
        format: '<div style="text-align:left;">' +
          '<span class="jauge_text_2">Production : {y} TWh <br />Conso + Pertes :  ' + parseInt(BilanV.valeur2050[10]) + ' TWh</span><span class="jauge_text_1"><br />' + expimp() + ' :  ' + Math.abs(parseInt(BilanV.valeur2050[3])) + ' TWh</span></div>'
      },

    }); //mise à jour du commentaire de la jauge
    Stock_Chart.series[0].setData([BilanV.valeur2050[12]]); //mise à jour du stockage

    $('#containerResults').html(resultats()); //mise à jour des résultats
    document.getElementById("lien").value = "http://www.electricite-2050.fr/?" + ArrayToURL(Consommation.valeur2050.concat(Production.valeur2050)); //mise à jour du lien partageable
    return "ok";

  }


/* Tracer les différents graphs */

// Tracer le graph consommation
  var Consommation_Chart = new Highcharts.Chart(Conso_Chart(Consommation));


// Tracer le camembert consommation
  var Consommation_Pie = new Highcharts.chart('Consommation_Pie', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Répartition de la consommation en 2050 (Total ' + parseInt(sum(Consommation.valeur2050)) + ' TWh/an)'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y:.1f} TWh</b>',
      format: '<b>{point.name}</b>: {point.percentage:.1f} %',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          distance: -30,
          format: '{point.percentage:.1f} %',
        },
        showInLegend: true

      }
    },
    credits: {
      enabled: false
    },
    series: [{
      name: 'Consommation',
      colorByPoint: true,
      data: PieTrace(Consommation),
    }]
  });




// Tracer le graph de production
  var Production_Chart = new Highcharts.Chart(Produ_Chart(Production));

// Tracer le camembert de Production
  var Production_Pie = new Highcharts.chart('Production_Pie', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Répartition de la Production en 2050'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y:.1f} TWh</b>',
      format: '<b>{point.name}</b>: {point.percentage:.1f} %',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          distance: -30,
          format: '{point.percentage:.1f} %',
        },
        showInLegend: true

      }
    },
    credits: {
      enabled: false
    },
    series: [{
      name: 'Production',
      colorByPoint: true,
      colors: Production.colors,
      data: PieTrace(Production),
    }]
  });

// Tracer le graph Bilan
  var Bilan_Chart = new Highcharts.Chart({

      chart: {
        renderTo: 'Bilan_Chart',
        animation: false,
        type: 'bar'
      },

      title: {
        text: 'Bilan de la Production vs. Consommation '
      },

      xAxis: {
        categories: ['2015', '2050'],
      },
      yAxis: [{
        title: {
          text: 'Électrcité (TWh)'
        },
        stackLabels: {
          enabled: true,
          crop: false,
          overflow: 'none',
          style: {
            fontWeight: 'bold',
            color: 'gray'
          },
          formatter: function() {
            return this.stack; // Monter Consommation/Production
          }
        },


      }],

      plotOptions: {
        series: {
          stacking: 'normal'
        },
      },
      credits: {
	// Un lien vers la page d'explications
        text: "Définitions des grandeurs et explications",
        href: "/a-propos/stockage-et-pertes/"
      },

      series: PlotBilan(Bilan(Consommation, Production)),



    },

  );

// Cacher le Bilan
  $('#Bilan_Chart').find('.highcharts-container').hide();
/* Afficher et cacher lors d'un clic sur le bouton Détails */
  var cnt = 0;
  $('#button').click(function() {
    if (cnt == 0) {
      $('#Bilan_Chart').find('.highcharts-container').show();
      cnt = 1;

    } else {
      $('#Bilan_Chart').find('.highcharts-container').hide();
      cnt = 0;
    }

  });


/* Cette fonction retourne le mot exportation ou importation en fonction du modèle */
  function expimp() {
    if (BilanV.valeur2050[3] > 0) {
      return "Exportations";

    } else {
      return "Importations";
    }


  }



// Tracé de la jauge
  var Production_jauge = new Highcharts.chart(Produ_jauge());


// Tracé du stockage
  var Stock_Chart = new Highcharts.Chart(Stock_Col(Production));

// Tracer les résultats
  $('#containerResults').html(resultats());


// Convertir un tableau en string query dans l'url
  function ArrayToURL(array) {
    var pairs = [];
    for (var key in array)
      if (array.hasOwnProperty(key))

        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(array[key]));
    return encodeURIComponent(pairs.join('&'));
  }

// Convertir un string query d'URL en tableau
  function URLToArray(url) {
    var request = [];
    var pairs = url.substring(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < pairs.length; i++) {
      if (!pairs[i])
        continue;
      var pair = pairs[i].split('=');
      request.push(parseInt(decodeURIComponent(pair[1])));
    }
    return request;
  }

/* Boutons de partage */

//Facebook
  $('#btnFB').click(function() {
    FB.ui({
      method: "feed",
      link: "http://www.electricite-2050.fr/?" + ArrayToURL(Consommation.valeur2050.concat(Production.valeur2050)),
    }, function(response) {
    });
  });
  
//Twitter
  $('#btnTW').click(function(e) {
    e.preventDefault();
    var loc = "http://www.electricite-2050.fr/?" + ArrayToURL(Consommation.valeur2050.concat(Production.valeur2050));
    var title = "Si je devais faire la transition énergétique, je la ferai comme ça ! Et vous ? #Electricite2050";
    window.open('http://twitter.com/share?url=' + loc + '&text=' + title + '&', 'twitterwindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 225) + ', left=' + $(window).width() / 2 + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
  });

//Télécharger en image
  $('#btnSave').click(function(e) {
    html2canvas($("#containerResults"), { // conversion du div en canvas
      onrendered: function(canvas) {
        var url = canvas.toDataURL();
        $("<a>", {
            href: url,
            download: "Electricite2050_MesResultats.png"
          })
          .on("click", function() {
            $(this).remove()
          })
          .appendTo("body")[0].click()
      }
    });
  });

// Afficher le lien
  $('#btnLink').click(function(e) {
    document.getElementById("lien").value = "http://www.electricite-2050.fr/?" + ArrayToURL(Consommation.valeur2050.concat(Production.valeur2050));
    document.getElementById('lien').style.display = "block";
    document.querySelector('#lien').select();
    document.execCommand('copy');
  });


// ??? bug ???
  Consommation_Chart.reflow()


/* Mise en place des modaux avec iframe pour les infos supplémentaires */
  function opendialog(page) { // ouverture d'un modal
    var $dialog = $('#somediv')
      .html('<iframe style="border: 0px; " target="_top" src="' + page + '" width="100%" height="100%" id="miframe"></iframe>')
      .dialog({
          title: "Explications",
          autoOpen: false,
          dialogClass: 'dialog_fixed,ui-widget-header',
          modal: true,
          height: $(window).height() * 0.9,
          width: $(window).width() * 0.7,
          minWidth: 350,
          draggable: true,
          //width: "auto",
          buttons: {
            "Ok": function() {
              $(this).dialog("close");
            }
          }
        }

      );
    $dialog.dialog('open');

  }
  $('#Industries').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/consommation/#IndustriesA");
  });
  $('#Résidentiel').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/consommation/#RésidentielA");
  });
  $('#Tertiaire').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/consommation/#TertiaireA");
  });
  $('#Transports').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/consommation/#TransportsA");
  });
  $('#Agriculture').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/consommation/#AgricultureA");
  });
  $('#Fossiles').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/production/#FossilesA");
  });
  $('#Nucléaire').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/production/#NucleaireA");
  });
  $('#Hydraulique').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/production/#HydrauliqueA");
  });
  $('#Éolien').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/production/#EolienA");
  });
  $('#Solaire').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/production/#SolaireA");
  });
  $('#Bioénergies').click(function() {
    opendialog("http://www.electricite-2050.fr/a-propos/production/#BioA");
  });
  $('#stocklab').click(function() {
    opendialog("/a-propos/stockage-et-pertes/");
  });
  X = ['reali', 'conso', 'enr', 'nucleaire', 'solaire', 'eolien', 'co2', 'cout', 'investissement', 'emploi', 'export', 'elec'];
  for (var i = 0; i < X.length; i++) {
    $('#' + X[i]).click(function() {
      opendialog("http://www.electricite-2050.fr/a-propos/resultats/#" + this.id);
    });

  }




/* Mise à jur des valeurs s'il y a des paramettres dans l'URL */
  AA = URLToArray(decodeURIComponent(window.location.search));
  if (AA.length > 5) {
    Consommation.valeur2050 = AA.slice(0, 5);
    Production.valeur2050 = AA.slice(5, 11);
    Update(1);
  }
 
/* tooltip  pour ajouter des infos dans le texte */
  var targets = $('[rel~=tooltip]'),
    target = false,
    tooltip = false,
    title = false;

  targets.bind('mouseenter', function() {
    target = $(this);
    tip = target.attr('title');
    tooltip = $('<div id="tooltip"></div>');

    if (!tip || tip == '')
      return false;

    target.removeAttr('title');
    tooltip.css('opacity', 0)
      .html(tip)
      .appendTo('body');

    var init_tooltip = function() {
      if ($(window).width() < tooltip.outerWidth() * 1.5)
        tooltip.css('max-width', $(window).width() / 2);
      else
        tooltip.css('max-width', 340);

      var pos_left = target.offset().left + (target.outerWidth() / 2) - (tooltip.outerWidth() / 2),
        pos_top = target.offset().top - tooltip.outerHeight() - 20;

      if (pos_left < 0) {
        pos_left = target.offset().left + target.outerWidth() / 2 - 20;
        tooltip.addClass('left');
      } else
        tooltip.removeClass('left');

      if (pos_left + tooltip.outerWidth() > $(window).width()) {
        pos_left = target.offset().left - tooltip.outerWidth() + target.outerWidth() / 2 + 20;
        tooltip.addClass('right');
      } else
        tooltip.removeClass('right');

      if (pos_top < 0) {
        var pos_top = target.offset().top + target.outerHeight();
        tooltip.addClass('top');
      } else
        tooltip.removeClass('top');

      tooltip.css({
          left: pos_left,
          top: pos_top
        })
        .animate({
          top: '+=10',
          opacity: 1
        }, 50);
    };

    init_tooltip();
    $(window).resize(init_tooltip);

    var remove_tooltip = function() {
      tooltip.animate({
        top: '-=10',
        opacity: 0
      }, 50, function() {
        $(this).remove();
      });

      target.attr('title', tip);
    };

    target.bind('mouseleave', remove_tooltip);
    tooltip.bind('click', remove_tooltip);
  });


});

