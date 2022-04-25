require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/renderers/DotDensityRenderer",
  "esri/widgets/Legend",
  "esri/widgets/Bookmarks",
  "esri/widgets/Expand",
  "esri/views/layers/support/FeatureFilter",
  "esri/tasks/support/Query"
], function (
  WebMap,
  MapView,
  FeatureLayer,
  DotDensityRenderer,
  Legend,
  Bookmarks,
  Expand,
  FeatureFilter,
  Query
) {
  // variable to populate county NAME values for selection.
  var countySelect = document.getElementById("county-select");

  // list of fields from langLayer
  var langfeatureFields = [
    "es_enMIN",
    "vi_enMIN",
    "zh_enMIN",
    "ru_enMIN",
    "afri_enMIN",
    "ko_enMIN",
    "oas_enMIN",
    "sla_enMIN",
    "opi_enMIN",
    "ine_enMIN",
    "ar_enMIN",
    "ja_enMIN",
    "tl_enMIN",
    "inc_enMIN",
    "mkh_enMIN",
    "fr_enMIN",
    "th_enMIN",
    "fa_enMIN",
    "de_enMIN",
    "lo_enMIN",
    "hi_enMIN",
    "hr_enMIN",
    "hmn_enMIN",
    "pt_enMIN",
    "other_enMIN",
    "it_enMIN",
    "hu_enMIN",
    "pl_enMIN",
    "ona_enMIN",
    "el_enMIN",
    "scd_enMIN",
    "frcreo_enMIN",
    "hy_enMIN",
    "wde_enMIN",
    "gu_enMIN",
    "ur_enMIN",
    "he_enMIN",
    "nv_enMIN",
    "yi_enMIN",
    "en",
    "Total"
  ];

  const arcadeExpressionInfos = [
    // Get Arcade expression returning the predominant language in census tract:
    // Which language is predominant
    {
      name: "predominantlang-arcade",
      title: "A portion of the population speak...",
      expression: document.getElementById("predominantlang-arcade").text
    },
    // Get Arcade expression returning the share of the total comprised
    // by the predominant category
    {
      name: "strength-arcade",
      title: "% of population belonging to majority category",
      expression: document.getElementById("strength-arcade").text
    },
    // Arcade expression that returns the total number of people who speak a different language
    // {
    //   name: "total-popEng",
    //   title: "Total population who speak a different language and ",
    //   expression: "$feature.POP_16UP - $feature.EMP_CY"
    // },
    //Arcade expression that returns the % of people who speak another language and have minimal comfort speaking english
    {
      name: "%-alternate_lang_speaker",
      title: "% of population who speak an alternative language to english",
      expression:
        "Round((($feature.Total - $feature.en)/$feature.Total)*100) + '%'"
    }
  ];

    const labelClass = {
        // autocasts as new LabelClass()
        symbol: {
            type: "text",  // autocasts as new TextSymbol()
            color: "#D3D3D3",
            font: {  // autocast as new Font()
                family: "Avenir Next LT Pro Light",
                style: "normal",
                weight: "normal"
        }
        },
        labelPlacement: "center",
        labelExpressionInfo: {
            expression: "$feature.NAME"
        }
    };

  // set up the custom renderer for county
  var boundaryRenderer = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
      color: [0, 0, 0, 0],
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1.5,
        color: "white"
      }
    }
  };

  // Create dotdensity renderer to showcase langugae
  var langRenderer = {
    type: "dot-density", // autocasts as new DotDensityRenderer()
    dotValue: 1,
    outline: {
      color: [240, 231, 216, 0.2],
      width: 0.75
    },
    legendOptions: {
      unit: "people"
    },
    attributes: [
      // {
      //   field: "en",
      //   color: "#37371F",
      //   label: "English Only"
      // },
      {
        field: "vi_enMIN",
        color: "#6CA6C1",
        label: "Vietnamese Language"
      },
      {
        field: "zh_enMIN",
        color: "#F49D6E",
        label: "Chinese Language"
      },
      {
        field: "ru_enMIN",
        color: "#EA9010",
        label: "Russian Language"
      },
      {
        field: "afri_enMIN",
        color: "#6184D8",
        label: "African Language"
      },
      {
        field: "ko_enMIN",
        color: "#007C77",
        label: "Korean Language"
      },
      {
        field: "oas_enMIN",
        color: "#00E5E8",
        label: "Other Asian Languages"
      },
      {
        field: "sla_enMIN",
        color: "#F0F600",
        label: "Other Slavic Languages"
      },
      {
        field: "es_enMIN",
        color: "#FF3CC7",
        label: "Spanish or Spanish Creole Language"
      }
      // Dotdensity renderer limit to 8 attributes.
      // {
      //   field: "opi_enMIN",
      //   color: "#585481",
      //   label: "Other Pacific Island Languages"
      // },
      // {
      //   field: "ine_enMIN",
      //   color: "#EFC7C2",
      //   label: "Other Indo-European Languages"
      // }
    ]
  };

  var countyBoundary = new FeatureLayer({
    url:
      "https://services9.arcgis.com/6EuFgO4fLTqfNOhu/arcgis/rest/services/Oregon_counties/FeatureServer/0",
      renderer: boundaryRenderer,
    labelingInfo: [labelClass]
  });

  //define language layer
  var langLayer = new FeatureLayer({
    url:
      "https://services.arcgis.com/uUvqNMGPm7axC2dD/arcgis/rest/services/ACS_2015_Languages_Spoken_at_home_5_years_and_over/FeatureServer",
    title: "Oregon Languages Spoken",
    renderer: langRenderer,
    outFields: langfeatureFields,
    popupTemplate: {
      title: "{COUNTY_1}: {NAMELSAD}",
      content: [
        {
          type: "text",
          text:
            "Within this census tract, {expression/%-alternate_lang_speaker} have an alternative language to english. There are {en} english speakers out of {Total}."
        },
        {
          type: "text",
          text: "Top 3 Alternative Languages Spoken: {expression/predominantlang-arcade}"
        }
      ],
      expressionInfos: arcadeExpressionInfos
    }
  });

  var map = new WebMap({
    // portalItem: {
    //   id: "56b5bd522c52409c90d902285732e9f1"
    // },
    basemap: "dark-gray",
    layers: [countyBoundary, langLayer]
  });

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-120.67, 43.55],
    zoom: 6,
    // popup: {
    //   dockEnabled: true,
    //   dockOptions: {
    //     position: "top-right",
    //     breakpoint: false
    //   },
    // constraints: {
    //   maxScale: 5000
    // },
    highlightOptions: {
      fillOpacity: 0.5,
      halocolor: "white"
    }
  });

  // Set up pop-up on hover
  // view.on("pointer-move", function (event) {
  //   view.hitTest(event).then(function (response) {
  //     if (response.results.length) {
  //       var graphic = response.results.filter(function (result) {
  //         // check if the graphic belongs to the layer of interest
  //         return result.graphic.layer === langLayer;
  //       })[0].graphic;
  //       view.popup.open({
  //         location: graphic.geometry.centroid,
  //         features: [graphic]
  //       });
  //     } else {
  //       view.popup.close();
  //     }
  //   });
  // });

  // set up auto populate drop down list of counties for user selection
  // query all features from language layer
  view
    .when(function () {
      return langLayer.when(function () {
        var query = langLayer.createQuery();
        return langLayer.queryFeatures(query);
      });
    })
    .then(getValues)
    .then(getUniqueValues)
    .then(addToSelect);

  // return an array of all the county values
  console.log("start get values func");

  function getValues(response) {
    var features = response.features;
    var values = features.map(function (feature) {
      return feature.attributes.COUNTY_1;
    });
    return values;
  }

  // return an array of unique values
  function getUniqueValues(values) {
    var uniqueValues = [];

    values.forEach(function (item, i) {
      if (
        (uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) &&
        item !== ""
      ) {
        uniqueValues.push(item);
      }
    });
    return uniqueValues;
  }

  // Add the unique values to the county select element.
  // This will allow the user to filter county.
  function addToSelect(values) {
    view.goTo(langLayer.fullExtent);
    console.log("add to select");
    values.sort();
    var option = document.createElement("option");
    option.text = ""; //intially show blank in the dd window
    countySelect.add(option);
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.text = value;
      countySelect.add(option);
      console.log("countySelect done!");
    });
  }

  function showCounty(event) {
    // retrieve the query stored in the selected value
    const countyQuery = countyBoundary.createQuery();
    countyQuery.where = "NAME = '" + event.target.value.split(" ")[0] + "'";
    // // update the definition expression of layer
    // var filter = new FeatureFilter({
    //   where: countyQuery
    // });
    // countyBoundary.filter = filter;
    // countyBoundary.definitionExpression = countyQuery;

    countyBoundary
      .when(() => {
        return countyBoundary.queryExtent(countyQuery);
      })
      .then((response) => {
        view.goTo(response.extent);
      });
  }

  document
    .getElementById("county-select")
    .addEventListener("change", showCounty);

  let legend = new Legend({
    view: view,
    container: document.getElementById("bottom-panelside"),
    layerInfos: [
      {
        layer: langLayer,
        title:
          "Most Common Languages Spoken alternative to English for all of Oregon",
        order: ""
      }
    ]
  });

  view.ui.add(legend, "bottom-left");
}); //end of script

