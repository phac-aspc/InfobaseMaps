// This section creates a color scale. A function could be created to do this.
var COLOR_SCALE = {
  ">10": "#a50f15",
  "1-10": "#fb6a4a",
  "0-1": "#fee5d9"
};

// D3 fetches the data
d3.csv("../src/data/projectData/RandomData.csv", function(error, data) {
  if (error) throw error;
  // format the data
  data.forEach(function(d) {
    d.percent = +d.Percent_Over_200;
    d.HR = +d.HR_Code;
  });

  // D3 fetches the topojson to create the map.
  d3.json('../src/topojson/Can_HR2007.json', function(mapJSON) {
    svg = d3.select('#map')
    .append('svg')
    .attr("id", "svg")
    .attr('width', "100%")
    .attr("preserveAspectRatio","xMinYMin meet")
    .attr("viewBox","0 0 900 800"); // Fix up the SVG attributes to fit and look how we want

    var healthregions = topojson.feature(mapJSON, mapJSON.objects.Can_HR2007);

    var projection = d3.geoIdentity(
      (function(x, y) {
        return [2*x, y]; // Create the projection
      }
    ))
    .reflectY(true) // Add some attributes that ensure it fist teh viewbox
    .fitExtent([[0, 0], [880, 880]], healthregions);

    var path = d3.geoPath().projection(projection);

    // Create SVG elements then bind data to them.
    var hrid = svg
    .append('g')
    .attr("id", "mapGroup")
    .attr("transform","translate(0,-50)")
    .selectAll('g')
    .data(healthregions.features)
    .enter()

    hrid
    .append("g")
    .append('path')
    .attr("id", function(d) { return d.properties["HR_CODE"]})
    .attr("class", "HR_CODE")
    .attr("d", path)
    .attr("stroke","#fff")
    .attr("stroke-width",1)

    // Make the legend and color the map
    drawLegend();
    colorMap()

    var mapColour
    d3.select("#mapGroup")
    .selectAll("g")
    //When hovering over a health region
    .on("mouseover", function(d){
      // Highlight the section
      d3.select(this).select("path").attr("stroke",'#333');
      d3.select(this).select("path").attr("stroke-width",3);

      mapColour = $(this)
      .children()
      .first()
      .attr("Style")
      .slice(6, ($(this).children().first().attr("Style").length -1))

      var t = textures
      .lines()
      .thicker()
      .background($(this).children().first().attr("style")
      .slice(6, ($(this).children().first().attr("Style").length -1)));

      svg.call(t);
      $(this).children().first().attr('style', "fill: "+t.url());

      document.getElementById("textarea").innerHTML =
      "The percentage of homes with X in <strong>"
      + d.properties.ENG_LABEL
      + "</strong> is <strong>"
      + d.percent
      + "%</strong>. In Canada, X is the highest cause of Y. November is X Action Month.";
    })

    .on("mouseout", function(d){
      $(this).children().first().attr('style', "fill: "+ mapColour +";");
      d3.select(this).select("path").attr("stroke",'#fff');
      d3.select(this).select("path").attr("stroke-width",1);
    })
    .on("focus", function(d){
      d3.select(this).select("path").attr("class","activeRegion");
      d3.select(this).select("path").attr("stroke",'#333');
      d3.select(this).select("path").attr("stroke-width",3);

      document.getElementById("textarea").innerHTML =
      "The percentage of homes with X in <strong>"
      + d.properties.ENG_LABEL
      + "</strong> is <strong>"
      + d.percent
      + "%</strong>. In Canada, X is the highest cause of Y. November is X Action Month.";

      mapColour = $(this)
      .children()
      .first()
      .attr("Style")
      .slice(6, ($(this)
      .children()
      .first()
      .attr("Style").length -1))

      var t = textures
      .lines()
      .thicker()
      .background($(this).children().first().attr("style")
      .slice(6, ($(this).children().first().attr("Style").length -1)));

      svg.call(t);

      $(this)
      .children()
      .first()
      .attr('style', "fill: "+t.url());

    }).on("focusout", function(d){
      $(this).children().first().attr('style', "fill: "+ mapColour +";");
      d3.select(this).select("path").attr("stroke",'#fff');
      d3.select(this).select("path").attr("stroke-width",1);
    })

  });

  function colorMap(){
    d3.selectAll(".HR_CODE")
    .style("fill", function(regions) {
      var HR = regions.properties["HR_CODE"];
      var i = 0;
      while (i < data.length){
        if (data[i]["HR"] == HR){
          regions.percent = data[i].percent
          return color(data[i].percent)
        }
        i ++
      }
    });
  }

  function color(value){
    if (value >= 10) return COLOR_SCALE[">10"];
    else if (value >= 1) return COLOR_SCALE["1-10"];
    else return COLOR_SCALE["0-1"];
  }

  function drawLegend(){
    var target = svg;
    var gap = 5;
    var squareSize = 20;
    var topMargin = 50;

    target.append('g')
    .attr('class', 'legend')
    .attr('id', 'legend')
    .attr("transform","translate(0,50)")
    .selectAll('g.category')
    .data(Object.keys(COLOR_SCALE))
    .enter()
    .append('g')
    .attr('class', 'category')
    .append('rect')
    .attr('x', 680)
    .attr('y', function(d, i) {
      return (squareSize+gap) * i + topMargin +30;
    })
    .attr('height', squareSize)
    .attr('width', function(d, i) {
      return squareSize*(5-i);
    })
    .style('fill', function(d) {
      return COLOR_SCALE[d];
    });

    d3.select("#legend")
    .append("text")
    .attr("x",560)
    .attr("font-size","20px")
    .attr("font-weight","bold")
    .append("tspan")
    .attr("y",topMargin-20)
    .text("Percentage of X")

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
        return "10 and higher"
      }else if(i==1){
        return "1 to 10"
      }else if(i==2){
        return "0 to 1";
      }
    });
  }

});
