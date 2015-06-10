var DataHelper = require('../../controllers/dataHelper');
var States = new DataHelper("states");
var Counties = new DataHelper("counties");
var async = require('async');

var CountyLoader = function (callback) {
  console.log('creating counties\n\n');
  var states = [
    {
      state: "Arkansas",
      counties: [
        "Arkansas", "Ashley", "Baxter", "Benton", "Boone", "Bradley", "Calhoun",
        "Carroll", "Chicot", "Clark", "Clay", "Cleburne", "Cleveland", "Columbia",
        "Conway", "Craighead", "Crawford", "Crittenden", "Cross", "Dallas", "Desha",
        "Drew", "Faulkner", "Franklin", "Fulton", "Garland", "Grant", "Greene",
        "Hempstead", "Hot Spring", "Howard", "Independence", "Izard", "Jackson",
        "Jefferson", "Johnson", "Lafayette", "Lawrence", "Lee", "Lincoln",
        "Little River", "Logan", "Lonoke", "Madison", "Marion", "Miller",
        "Mississippi", "Monroe", "Montgomery", "Nevada", "Newton", "Ouachita",
        "Perry", "Phillips", "Pike", "Poinsett", "Polk", "Pope", "Prairie",
        "Pulaski", "Randolph", "St. Francis", "Saline", "Scott", "Searcy",
        "Sebastian", "Sevier", "Sharp", "Stone", "Union", "Van Buren",
        "Washington", "White", "Woodruff", "Yell"
      ]
    },

    {
      state: "Colorado",
      counties: [
        "Adams", "Alamosa", "Arapahoe", "Archuleta", "Baca", "Bent",
        "Boulder", "Broomfield", "Chaffee", "Cheyenne", "Clear", "Conejos",
        "Costilla", "Crowley", "Custer", "Delta", "Denver", "Dolores",
        "Douglas", "Eagle", "Elbert", "El Paso", "Fremont", "Garfield",
        "Gilpin", "Grand", "Gunnison", "Hinsdale", "Huerfano", "Jackson",
        "Jefferson", "Kiowa", "Kit Carson", "Lake", "La Plata", "Larimer",
        "Las Animas", "Lincoln", "Logan", "Mesa", "Mineral", "Moffat",
        "Montezuma", "Montrose", "Morgan", "Otero", "Ouray", "Park",
        "Phillips", "Pitkin", "Prowers", "Pueblo", "Rio Blanco", "Rio Grande",
        "Routt", "Saguache", "San Juan", "San Miguel", "Sedgwick", "Summit",
        "Teller", "Washington", "Weld", "Yuma"
      ]
    },

    {
      state: "Louisiana",
      counties: [
        "Acadia", "Allen", "Ascension", "Assumption", "Avoyelles",
        "Beauregard", "Bienville", "Bossier", "Caddo", "Calcasieu",
        "Caldwell", "Cameron", "Catahoula", "Claiborne", "Concordia",
        "De Soto", "East Baton Rouge", "East Carroll", "East Feliciana",
        "Evangeline", "Franklin", "Grant", "Iberia", "Iberville", "Jackson",
        "Jefferson", "Jefferson Davis", "Lafayette", "Lafourche", "La Salle",
        "Lincoln", "Livingston", "Madison", "Morehouse", "Natchitoches",
        "Orleans", "Ouachita", "Plaquemines", "Pointe Coupee", "Rapides",
        "Red River", "Richland", "Sabine", "St. Bernard", "St. Charles",
        "St. Helena", "St. James", "St. John the Baptist", "St. Landry",
        "St. Martin", "St. Mary", "St. Tammany", "Tangipahoa", "Tensas",
        "Terrebonne", "Union", "Vermilion", "Vernon", "Washington", "Webster",
        "West Baton Rouge", "West Carroll", "West Feliciana", "Winn"
      ]
    },

    {
      state: "New Mexico",
      counties: [
        "Bernalillo", "Catron ", "Chaves ", "Cibola ",
        "Colfax ", "Curry ", "De Baca", "Dona Ana",
        "Eddy ", "Grant ", "Guadalupe ", "Harding ",
        "Hidalgo ", "Lea ", "Lincoln ", "Los Alamos",
        "Luna ", "McKinley ", "Mora ", "Otero ",
        "Quay ", "Rio Arriba", "Roosevelt ", "Sandoval ",
        "San Juan", "San Migeul", "Sante Fe", "Sierra", "Socorro", "Taos",
        "Torrance", "Union", "Valencia"
      ]
    },

    {
      state: "Oklahoma",
      counties: [
        "Adair", "Alfalfa", "Atoka", "Beaver", "Beckham", "Blaine", "Bryan", "Caddo",
        "Canadian", "Carter", "Cherokee", "Choctaw", "Cimarron", "Cleveland",
        "Coal", "Comanche", "Cotton", "Craig", "Creek", "Custer", "Delaware",
        "Dewey", "Ellis", "Garfield", "Garvin", "Grady", "Grant", "Greer",
        "Harmon", "Harper", "Haskell", "Hughes", "Jackson", "Jefferson",
        "Johnston", "Kay", "Kingfisher", "Kiowa", "Latimer", "Le Flore",
        "Lincoln", "Logan", "Love", "Major", "Marshall", "Mayes", "McClain",
        "McCurtain", "McIntosh", "Murray", "Muskogee", "Noble", "Nowata",
        "Okfuskee", "Oklahoma", "Okmulgee", "Osage", "Ottawa", "Pawnee",
        "Payne", "Pittsburg", "Pontotoc", "Pottawatomie", "Pushmataha",
        "Roger Mills", "Rogers", "Seminole", "Sequoyah", "Stephens", "Texas",
        "Tillman", "Tulsa", "Wagoner", "Washington", "Washita", "Woods",
        "Woodward"
      ]
    },

    {
      state: "Texas",
      counties: [
        "Anderson", "Andrews", "Angelina", "Aransas",
        "Archer", "Armstrong", "Atascosa", "Austin",
        "Bailey", "Bandera", "Bastrop", "Baylor",
        "Bee", "Bell", "Bexar", "Blanco", "Borden",
        "Bosque", "Bowie", "Brazoria", "Brazos", "Brewster",
        "Briscoe", "Brooks", "Brown", "Burleson", "Burnet",
        "Caldwell", "Calhoun", "Callahan", "Cameron", "Camp",
        "Carson", "Cass", "Castro", "Chambers", "Cherokee",
        "Childress", "Clay", "Cochran", "Coke", "Coleman",
        "Collin", "Collingsworth", "Colorado", "Comal", "Comanche",
        "Concho", "Cooke", "Coryell", "Cottle", "Crane", "Crockett",
        "Crosby", "Culberson", "Dallam", "Dallas", "Dawson", "Deaf Smith",
        "Delta", "Denton", "DeWitt", "Dickens", "Dimmit", "Donley",
        "Duval", "Eastland", "Ector", "Edwards", "Ellis", "El Paso",
        "Erath", "Falls", "Fannin", "Fayette", "Fisher", "Floyd",
        "Foard", "Fort Bend", "Franklin", "Freestone", "Frio", "Gaines",
        "Galveston", "Garza", "Gillespie", "Glasscock", "Goliad", "Gonzales",
        "Gray", "Grayson", "Gregg", "Grimes", "Guadalupe", "Hale", "Hall",
        "Hamilton", "Hansford", "Hardeman", "Hardin", "Harris", "Harrison",
        "Hartley", "Haskell", "Hays", "Hemphill", "Henderson", "Hidalgo",
        "Hill", "Hockley", "Hood", "Hopkins", "Houston", "Howard",
        "Hudspeth", "Hunt", "Hutchinson", "Irion", "Jack", "Jackson",
        "Jasper", "Jeff Davis", "Jefferson", "Jim Hogg", "Jim Wells", "Johnson",
        "Jones", "Karnes", "Kaufman", "Kendall", "Kenedy", "Kent", "Kerr",
        "Kimble", "King", "Kinney", "Kleberg", "Knox", "Lamar", "Lamb",
        "Lampasas", "La Salle", "Lavaca", "Lee", "Leon", "Liberty",
        "Limestone", "Lipscomb", "Live Oak", "Llano", "Loving", "Lubbock",
        "Lynn", "McCulloch", "McLennan", "McMullen", "Madison", "Marion",
        "Martin", "Mason", "Matagorda", "Maverick", "Medina", "Menard",
        "Midland", "Milam", "Mills", "Mitchell", "Montague", "Montgomery",
        "Moore", "Morris", "Motley", "Nacogdoches", "Navarro", "Newton",
        "Nolan", "Nueces", "Ochiltree", "Oldham", "Orange", "Palo Pinto",
        "Panola", "Parker", "Parmer", "Pecos", "Polk", "Potter", "Presidio",
        "Rains", "Randall", "Reagan", "Real", "Red River", "Reeves",
        "Refugio", "Roberts", "Robertson", "Rockwall", "Runnels", "Rusk",
        "Sabine", "San Augustine", "San Jacinto", "San Patricio", "San Saba",
        "Schleicher", "Scurry", "Shackelford", "Shelby", "Sherman", "Smith",
        "Somervell", "Starr", "Stephens", "Sterling", "Stonewall", "Sutton",
        "Swisher", "Tarrant", "Taylor", "Terrell", "Terry", "Throckmorton",
        "Titus", "Tom Green", "Travis", "Trinity", "Tyler", "Upshur",
        "Upton", "Uvalde", "Val Verde", "Van Zandt", "Victoria", "Walker",
        "Waller", "Ward", "Washington", "Webb", "Wharton", "Wheeler", "Wichita",
        "Wilbarger", "Willacy", "Williamson", "Wilson", "Winkler", "Wise",
        "Wood", "Yoakum", "Young", "Zapata", "Zavala"
      ]
    }
  ];

  async.eachSeries(states,
    function (obj, cb1) {
      var state;
      var stateName = obj.state;
      var counties = obj.counties;
      States.read({query: {name: stateName}}, function (err, dbState) {
        if (err) { throw err; }
        if (!dbState) { throw new Error("Problem occured loading dbState."); }
        console.log(dbState.name+':');
        state = dbState;

        async.eachSeries(counties,
          function (countyName, cb2) {
            var county = { name: countyName, state: state };
            Counties.create({obj: county, query: {name: countyName}},
            function (err, dbCounty) {
              console.log('\t'+dbCounty.name+' created');
              return cb2(err);
            });
          },
          function (err) {
            return cb1(err);
          }
        );
      });
    },
    function (err) {
      return callback(err);
    });

}

module.exports = CountyLoader;
