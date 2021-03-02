var language = $('html').attr('lang');

let isIE = /*@cc_on!@*/false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent))
isIE = true;

// This section creates a color scale. A function could be created to do this.
var COLOR_SCALE = {
  "4.188 to 6.395": "#d7191c",
  "2.197 to 4.187": "#fdae61",
  "0.950 to 2.196": "#ffffbf",
  "0.315 to 0.949": "#abd9e9",
  "0.003 to 0.314": "#2c7bb6"
};

// D3 fetches the data
d3.csv("../src/data/ProvData/data.csv", function(error, data) {

  if (error) throw error;

  // format the data
  data.forEach(function(d) {
    d.year = +d["year"]
    d.month = +d["month"]
    d.hirisk = +d["hirisk"]
    d.age = +d["age"]
    d.PRUID = +d.PRUID;
  });

  // D3 fetches the topojson to create the map.
  d3.json('../src/topojson/ProvincesTerritoriesMap.json', function(mapJSON) {
    svg = d3.selectAll('#map')
    .append('svg')
    .attr("id", "svg")
    .attr('width', "100%")
    .attr('height',function(){
      if(isIE){
        return 650;
      }
    })
    .attr("preserveAspectRatio","xMinYMin meet")
    .attr("viewBox","0 0 900 800"); // Fix up the SVG attributes to fit and look how we want

    var provinces = topojson.feature(mapJSON, mapJSON.objects.Can_PR2016);

    var projection = d3.geoIdentity((function(x, y) {
      return [2*x, y]; // Create the projection
    }))
    .reflectY(true) // Add some attributes that ensure it fist teh viewbox
    .fitExtent([[0, 0], [880, 880]], provinces);

    // Create SVG elements then bind data to them.
    var path = d3.geoPath().projection(projection);

    var hrid = svg
    .append('g')
    .attr("id", "mapGroup")
    .attr("transform","translate(0,-50)")
    .selectAll('g')
    .data(provinces.features)
    .enter()

    hrid
    .append("g")
    .attr("focusable","true")
    .append('path')
    .attr("id", function(d) { return d.properties["PRUID"]})
    .attr("class", "PRUID")
    .attr("d", path)
    .attr("stroke","#333")
    .attr("stroke-width",1);

    // Make the legend and color the map
    drawLegend();
    colorMap();

    d3.select("#mapGroup")
    .selectAll("g")
    // When hovering over a Health Region
    .on("mouseover", function(d){

      // Highlight the section
      if(!d3.select(this).select("path").classed("activeRegion")){
        d3.select(this).select("path").attr("data-fill",d3.select(this).select("path").attr("fill"));

        // Add texture to the shape
        var t = textures
        .lines()
        .thicker()
        .background(d3.select(this)
        .select("path")
        .attr("fill"));

        svg.call(t);

        $(this).children().first().attr('fill',t.url());
        d3.select(this).select("path").attr("class","activeRegion");
        d3.select(this).select("path").attr("stroke",'#333');
        d3.select(this).select("path").attr("stroke-width",3);
      }

      document.getElementById("textarea").innerHTML =
      "<p>This map shows X rate of Y in Canada"
      +"<p>The mean age for X in <strong>"
      + d.properties.PRENAME + "</strong> in 2018 was <strong>"
      + d.age
      + "%</strong>.</p>";
    })
    // Do the same things as on hover but when a Health Region is tabbed over (Accessibility)
    .on("focus", function(d){
      if(!d3.select(this).select("path").classed("activeRegion")){
        d3.select(this).select("path").attr("data-fill",d3.select(this).select("path").attr("fill"));
        console.log("focus oldColour is : ",oldColour);

        var t = textures
        .lines()
        .thicker()
        .background(d3.select(this)
        .select("path")
        .attr("fill"));

        svg.call(t);

        $(this).children().first().attr('fill',t.url());
        d3.select(this).select("path").attr("class","activeRegion");
        d3.select(this).select("path").attr("stroke",'#333');
        d3.select(this).select("path").attr("stroke-width",3);
      }

      document.getElementById("textarea").innerHTML =
      "<p>This map shows X rate of Y in Canada"
      +"<p>The X rate (per 100,000) attributed to Y in the <strong>"
      + d.properties.PRENAME + "</strong> census district in 2018 was <strong>"
      + d.percent
      + "%</strong>.</p>";
    })
    //Whean leaving a shape return it to normal
    .on("mouseout", function(d){
      $(this).children().first().attr('fill',d3.select(this).select('path').attr('data-fill'));
      d3.select(this).select("path").attr("stroke",'#333');
      d3.select(this).select("path").attr("stroke-width",1);
      d3.select(this).select("path").classed("activeRegion",false);
    })
    //Undo it when we tab out of a Health Regions
    .on("focusout", function(d){
      $(this).children().first().attr('fill',d3.select(this).select('path').attr('data-fill'));
      d3.select(this).select("path").attr("stroke",'#333');
      d3.select(this).select("path").attr("stroke-width",1);
      d3.select(this).select("path").classed("activeRegion",false);
    })

  });

  // Colours in all the census regions of the map
  function colorMap(){
    d3.selectAll(".PRUID")
    .attr("fill", function(regions) {
      var PRUID = regions.properties["PRUID"];
      var i = 0;
      while (i < data.length){
        if (data[i]["PRUID"] == PRUID){
          regions.percent = data[i].percent;
          return color(data[i].percent)
        } else {

        }
        i ++
      }

    });
  }

  // Return a color value depending on the value of the data
  function color(value){
    if (value >= 4.188) return COLOR_SCALE["4.188 to 6.395"];
    else if (value >= 2.197) return COLOR_SCALE["2.197 to 4.187"];
    else if (value >= 0.950) return COLOR_SCALE["0.950 to 2.196"];
    else if (value >= 0.315) return COLOR_SCALE["0.315 to 0.949"];
    else return COLOR_SCALE["0.003 to 0.314"];
  }

  // As the function name says... Creates and appends a Legend to the SVG
  function drawLegend(){
    var target = svg;

    var gap = 5;
    var squareSize = 20;
    var topMargin = 50;

    // Appends a rectangle for every element of the color scale
    target.append('g')
    .attr('class', 'legend')
    .attr('id', 'legend')
    .attr("transform","translate(50,50)")
    .selectAll('g.category')
    .data(Object.keys(COLOR_SCALE))
    .enter()
    .append('g')
    .attr('class', 'category')
    .attr("transform","translate(40,0)")
    .append('rect')
    .attr('x', 680)
    .attr('y', function(d, i) {
      return (squareSize+gap) * i + topMargin +30;
    })
    .attr('height', squareSize)
    .attr('width', function(d, i) {
      return squareSize*(5-i);
    })
    .attr("stroke","#333")
    .style('fill', function(d) {
      return COLOR_SCALE[d];
    });

    // Appends a title to the legend
    d3.select("#legend")
    .append("text")
    .attr("x",560)
    .attr("font-size","20px")
    .attr("font-weight","bold")
    .append("tspan")
    .attr("y",topMargin-20)
    .text("X rate (per 100,000)");

    // Appends text to all the categories (rectangles) of the legend
    d3.selectAll('.category')
    .append('text')
    .attr("class", "legend-text")
    .style("font-size","20px")
    .attr("x", function(d,i) {
      return 680 - 20
    })
    .attr("y", function(d, i) {
      return (squareSize+gap) * i + squareSize/2 + topMargin + 30;
    })
    .attr("dy",".35em")
    .style("text-anchor","end")
    .text(function(d,i){
        if(i==0){
          return "4.188 to 6.395";
        }else if(i==1){
          return "2.197 to 4.187";
        }else if(i==2){
          return "0.950 to 2.196";
        }else if(i==3){
          return "0.315 to 0.949"
        }else if(i==4){
          return "0.003 to 0.314";
        }
    });
  }
});
