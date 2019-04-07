/**
 * Call our functions on window load event
 */
window.onload = function(){
    setupVis3();
};


/**
 * Global variables
 */
const WIDTH = 800;
const HEIGHT = 800;
const MARGIN = {top:50, bottom:50, left:50, right:50};
const start = 2.2,
    end = 0,
    spiralNum = 3,
    minRadius = 60;

var selection = [];
var popUp;
var colorScale;

theta = function(r) {
    return spiralNum * Math.PI * r;
};


function setSpiral3(data){

    // set svg attributes
    var svg = d3.select('#v13_svg')
        .attr("width", WIDTH + MARGIN.right + MARGIN.left)
        .attr("height", HEIGHT + MARGIN.right + MARGIN.left)
        .append("g")
        .attr('id', "g-vis3")
        .attr("transform", "translate(500,470)");

    // draw the plain spiral
    var r = d3.min([WIDTH, HEIGHT])/2-minRadius;
    var radius = d3.scaleLinear()
        .domain([start, end])
        .range([minRadius, r]);

    var spiral3 = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(theta)
        .radius(radius);

    var points = d3.range(start, end + 0.001, (end-start)/1000);

    var path = svg.append("path")
        .datum(points)
        .attr("id", "spiral3")
        .attr("d", spiral3)
        .style("fill", "none")
        .style("stroke", "steelblue");

    // set scales
    var spiralLength = path.node().getTotalLength(),
        N = data.length-1,
        barWidth = (spiralLength/N) - 1;

    var xScale = d3.scaleBand()
        .domain(data.map(function(d){
            return d['Country/Region'];
        }))
        .range([0,spiralLength]);

    var yScale = d3.scaleLinear()
        .domain([0,15])
        .range([0, 60]);

    colorScale = d3.scaleQuantize()
        .domain([0,30])
        .range(colorbrewer.PuBuGn[5]);


    // Add background color to the rectangle
    svg.append('g')
        .attr("id", "g_vis3_bgd");

    d3.select("#g_vis3_bgd")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "vis3_rect_bgd")
        .attr("x", function(d){
            var linePer = xScale(d['Country/Region']),
                posOnLine = path.node().getPointAtLength(linePer),
                angleOnLine = path.node().getPointAtLength(linePer - barWidth);

            d.linePer = linePer;
            d.x = posOnLine.x;
            d.y = posOnLine.y;
            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180/Math.PI) - 90;

            return d.x;
        })
        .attr("y", function(d){
            return d.y;
        })
        .attr("width", function(d){
            return barWidth;
        })
        .attr("height", function(d){
            return 60;
        })
        .style("fill", function(d){
            // return d3.interpolateSpectral(colorScale(d['Share of education in governmental expenditure (%)']));
            if(d['Share of education in governmental expenditure (%)'] !== "")
                return colorScale(d['Share of education in governmental expenditure (%)']);
            else return "#666666";
        })
        .style("opacity", 0.7)
        .attr("transform", function(d){
            return `rotate(${d.a},${d.x},${d.y})`;
        });

    // bind data to the spiral
    svg.append('g')
        .attr("id", "g_vis3_data");
    d3.select("#g_vis3_data")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "vis3_rect")
        .attr("x", function(d){
            var linePer = xScale(d['Country/Region']),
                posOnLine = path.node().getPointAtLength(linePer),
                angleOnLine = path.node().getPointAtLength(linePer - barWidth);

            d.linePer = linePer;
            d.x = posOnLine.x;
            d.y = posOnLine.y;
            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180/Math.PI) - 90;

            return d.x;
        })
        .attr("y", function(d){
            return d.y;
        })
        .attr("width", function(d){
            return barWidth;
        })
        .attr("height", function(d){
            return yScale(d['Mean years of schooling']);
        })
        .style("fill", function(d){
            // return d3.interpolateSpectral(colorScale(d['Share of education in governmental expenditure (%)']));
            if(d['Share of education in governmental expenditure (%)'] !== "")
                return colorScale(d['Share of education in governmental expenditure (%)']);
            else return "#666666";
        })
        .style("stroke", "grey")
        .style("stroke-width", "1px")
        .attr("transform", function(d){
            return `rotate(${d.a},${d.x},${d.y})`;
        });

    var cnt = 0;
    // Add text
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("dy", -5)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .append("textPath")
        // only add for the first of each month
        .filter(function(d){
            if(cnt === 0){
                d.labelFlg = true;
            }else d.labelFlg = false;
            if(cnt++ % 18 === 0 || cnt === 213)return true;
            return false;
        })
        .text(function(d){
            if(d.labelFlg === true){
                return "Literacy rate";
            }
            else return (d['Literacy rate(%)'] + "%");
        })
        .attr("font-weight", function(d){
            if(d.labelFlg === true){
                return "bold";
            }
            else return "normal";
        })
        .attr("font-size", function(d){
            if(d.labelFlg === true){
                return "14px";
            }
            else return "10px";
        })
        // place text along spiral
        .attr("xlink:href", "#spiral3")
        .style("fill", "dark-grey")
        .attr("startOffset", function(d){
            return ((d.linePer / spiralLength) * 100) + "%";
        });

    var x0 = 500,
        y0 = -250;
    var legend1 = [];

    for(let i=0; i<5; i++){
        legend1.push({
            value: i,
            pos: [x0, y0+i*30],
            t: Math.round(i * 6 )+ "~" +
                Math.round((i+1) * 6) + "%"
        });
    }
    legend1.push({value:-1, pos:[x0, y0+150], t:"Not Available"});
    //legend group
    d3.select("#v13_svg")
        .append("g")
        .attr("class", "legend31")
        .attr("transform", "translate(" + 500 + "," + 450 +")");

    d3.select('.legend31')
        .selectAll("rect")
        .data(legend1)
        .enter()
        .append("rect")
        .attr("x", function(d){
            return d.pos[0];
        })
        .attr("y", function(d){
            return d.pos[1];
        })
        .attr("height", 20)
        .attr("width", 30)
        .style("fill", function(d){
            if(d.value === -1){
                return "#666666";
            }
            else return colorbrewer.PuBuGn[5][d.value];
        })
        .style("stroke", "grey")
        .style("stroke-width", "1px");

    d3.select('.legend31')
        .selectAll("text")
        .data(legend1)
        .enter()
        .append("text")
        .attr("x", function(d){
            return d.pos[0] + 40;
        })
        .attr("y", function(d){
            return d.pos[1] + 15;
        })
        .text(function(d){
            return d.t;
        });

    d3.select('.legend31')
        .append("text")
        .attr("x", x0-20)
        .attr("y", y0-40)
        .text("Share of education in")
        .attr("font-weight", "bold");
    d3.select('.legend31')
        .append("text")
        .attr("x", x0-20)
        .attr("y", y0-20)
        .text("government expenditure")
        .attr("font-weight", "bold");


    // draw axis
    var yAxisScale = d3.scaleLinear()
        .domain([15,0])
        .range([0, 60]);
    var yAxis = d3.axisLeft(yAxisScale)
        .tickValues([0,5,10,15]);

    var legend22 = d3.select("#v13_svg")
        .append("g")
        .attr("class", "axis3")
        .attr("transform", "translate(" + 505 + "," + 70 +")")
        .style("dominant-baseline", "central")
        .call(yAxis)
        .attr("stroke", "black")
        .attr("fill", "grey");

    legend22.select("path").attr("marker-end", "url(#arrowhead)");

    var x1 = -20,
        y1 = y0-150;
    d3.select('.legend31')
        .append("text")
        .attr("x", x1)
        .attr("y", y1)
        .text("Mean year of schooling (years)")
        .attr("font-weight", "bold");
    d3.select('.legend31')
        .append("text")
        .attr("x", x1-85)
        .attr("y", y1 + 88)
        .style("font-size", 12)
        .text("Not Available/");


    // Interaction
    popUp = d3.select("#div_visuals")
        .append('div')
        .attr('class', 'tooltip');
    popUp.append('div')
        .attr('class','country');
    popUp.append('div')
        .attr('class', 'literacy');
    popUp.append('div')
        .attr('class', 'schooling');
    popUp.append('div')
        .attr('class', 'expenditure');

    d3.select("#g-vis3")
        .selectAll(".vis3_rect_bgd")
        .on('mouseover', function(d){
            onMouseOver(d, this);
        })
        .on('mousemove', function(d){
            onMouseMove(d);
        })
        .on('click', function(d){
            onMouseClick(d, this);
        })
        .on('mouseout', function(d){
            onMouseOut(d, this);
        });

    d3.select("#g_vis3_data")
        .selectAll("rect")
        .on('mouseover', function(d){
            d3.selectAll(".vis3_rect_bgd")
                .select(function(x){
                    if(d===x){
                        onMouseOver(x, this);
                    }
                });
        })
        .on('mousemove', function(d){
            onMouseMove(d);
        })
        .on('click', function(d){
            d3.selectAll(".vis3_rect_bgd")
                .select(function(x){
                    if(d===x){
                        onMouseClick(x, this);
                    }
                });
        })
        .on('mouseout', function(d){
            d3.selectAll(".vis3_rect_bgd")
                .select(function(x){
                    if(d===x){
                        onMouseOut(x, this);
                    }
                });
        });

    // finish selection button
    d3.select('.legend31')
        .append('rect')
        .attr('id', 'selectionBtn')
        .attr('width', 80)
        .attr('height', 30)
        .attr('x', x0)
        .attr('y', y0+240)
        .attr('rx', 6)
        .attr('ry', 6)
        .style('stroke', 'grey')
        .style('fill','rgb(236,236,236)')
        .style('display', 'none')
        .on('mouseover', function(d){
            d3.select(this)
                .style('fill', 'rgb(189,201,224)');
        })
        .on('mouseout', function(d){
            d3.select(this)
                .style('fill', 'rgb(236,236,236)');
        })
        .on('click', function(d){
            finishSelection();
        });

    d3.select('.legend31')
        .append('text')
        .attr('id', 'btnText')
        .attr('x', x0+40)
        .attr('y', y0+257)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '14px')
        .attr('font-weight', 12)
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .text('Finish')
        .style('display', 'none');

    setupPopup();
}

function emptySelection(){
    selection = [];
    d3.selectAll(".vis3_rect_bgd")
        .select(function(d){
            if(d.isSelected === true){
                d.isSelected = false;
                return this;
            }
            return null;
        })
        .style("fill", function(d){
            if(d['Share of education in governmental expenditure (%)'] !== "")
                return colorScale(d['Share of education in governmental expenditure (%)']);
            else return "#666666";
        }).style("stroke", "grey")
        .style("stroke-width", "0")
        .style("opacity", 0.7);

    d3.select('#vis-pop')
        .style('display', 'none');
    d3.select('#selectionBtn')
        .style('display', 'none');
    d3.select('#btnText')
        .style('display', 'none');

    d3.selectAll('.pop').remove();

}

function setupPopup(){
    d3.select('#v13_svg')
        .append("g")
        .attr('id', "vis-pop")
        .attr("transform", "translate(0,0)")
        .style('display', 'none');

    var w = d3.select('#v13_svg').node().getBoundingClientRect().width !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().width : WIDTH;
    var h = d3.select('#v13_svg').node().getBoundingClientRect().height !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().height : HEIGHT;
    d3.select('#vis-pop')
        .append('rect')
        .attr('id', 'vis-pop-bgd')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', w)
        .attr('height', h)
        .attr('fill', 'rgb(236,236,236)')
        .attr('opacity', 0.9);
    d3.select('#vis-pop')
        .append('rect')
        .attr('id', 'pop-close-rect')
        .attr('x', w-40)
        .attr('y', 0)
        .attr('width', 40)
        .attr('height', 35)
        .style('fill', 'coral')
        .style('stroke', 'grey')
        .on('click', function(d){
            emptySelection();
        });
    d3.select('#vis-pop')
        .append('text')
        .attr('id', 'pop-close-text')
        .text('X')
        .attr('x', w-20)
        .attr('y', 18)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '25px')
        .attr('font-weight', 15)
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('fill', '#666666');
}

function createBarChart1(){
    var w = d3.select('#v13_svg').node().getBoundingClientRect().width !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().width : WIDTH;
    var h = d3.select('#v13_svg').node().getBoundingClientRect().height !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().height : HEIGHT;

    const margin = 150,
        padding = 10;
    let yScale = d3.scaleLinear()
        .domain([0,100])
        .range([h-2*margin,0]);

    let xScale = d3.scaleBand()
        .domain(getCountries())
        .rangeRound([0, (w-margin)/3.0-margin])
        .padding(0.2);

    let xAxis, yAxis;
    createBars();

    setUpAxis();

    function setUpAxis(){
        xAxis = d3.axisBottom(xScale)
            .ticks(getCountries());
        yAxis = d3.axisLeft(yScale)
            .ticks(10)
            .tickPadding(10);

        d3.select('#v13_svg').append('g').attr('id', 'bar1-x').attr('class', 'pop')
            .attr('transform', "translate("+margin +"," + (h-margin) +")")
            .call(xAxis)
            .selectAll('text')
            .attr('x', 10)
            .attr('transform','rotate(45)')
            .attr('text-anchor', 'start')
            .style('alignment-baseline', 'middle')
            .style('fill', 'black');

        d3.select('#v13_svg').append('g').attr('id', 'bar1-y').attr('class', 'pop')
            .attr('transform', "translate("+margin +"," + margin +")")
            .call(yAxis);

        d3.select('#bar1-y').append('text')
            .attr('x', margin)
            .attr('y', h/2.0)
            .attr('transform', `rotate(-90, -50, ${h/2.0})`)
            .style('text-anchor', 'middle')
            .style('font-size','1em')
            .style('font-weight',400)
            .text('Literacy rate(%)')
            .style('fill', 'black');
    }

    function createBars(){
        d3.select('#v13_svg')
            .append("g")
            .attr('id', "vis-pop-bar1").attr('class', 'pop')
            .attr("transform", "translate("+margin +"," + margin +")");

        d3.select('#vis-pop-bar1')
            .selectAll('rect')
            .data(selection)
            .enter()
            .append('rect')
            .attr('x', function(d){
                return padding + xScale(d['Country/Region']);
            })
            .attr('y', function(d){
                return yScale(d['Literacy rate(%)']);
            })
            .attr('width', 20)
            .attr('height', function(d){
                return h-2*margin- yScale(d['Literacy rate(%)']);
            })
            .style('fill', 'rgb(106,169,205')
            .style('stroke', 'grey')
            .append('svg:title')
            .text(function(d){
                return d['Literacy rate(%)'];
            });
    }

    function getCountries(){
        var countries = [];
        selection.forEach(function(e){
            countries.push(e['Country/Region']);
        })
        return countries;
    }
}

function createBarChart2(){
    var w = d3.select('#v13_svg').node().getBoundingClientRect().width !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().width : WIDTH;
    var h = d3.select('#v13_svg').node().getBoundingClientRect().height !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().height : HEIGHT;

    const margin = 150,
        padding = 10;
    let yScale = d3.scaleLinear()
        .domain([0,15])
        .range([h-2*margin,0]);

    let xScale = d3.scaleBand()
        .domain(getCountries())
        .rangeRound([0, (w-margin)/3.0-margin])
        .padding(0.2);

    let xAxis, yAxis;
    createBars();

    setUpAxis();

    function setUpAxis(){
        xAxis = d3.axisBottom(xScale)
            .ticks(getCountries());
        yAxis = d3.axisLeft(yScale)
            .ticks(15)
            .tickPadding(10);

        d3.select('#v13_svg').append('g').attr('id', 'bar2-x').attr('class', 'pop')
            .attr('transform', "translate("+(margin+(w-margin)/3) +"," + (h-margin) +")")
            .call(xAxis)
            .selectAll('text')
            .attr('x', 10)
            .attr('transform','rotate(45)')
            .attr('text-anchor', 'start')
            .style('alignment-baseline', 'middle')
            .style('fill', 'black');

        d3.select('#v13_svg').append('g').attr('id', 'bar2-y').attr('class', 'pop')
            .attr('transform', "translate("+(margin+(w-margin)/3) +"," + margin +")")
            .call(yAxis);

        d3.select('#bar2-y').append('text')
            .attr('x', margin)
            .attr('y', h/2.0)
            .attr('transform', `rotate(-90, -50, ${h/2.0})`)
            .style('text-anchor', 'middle')
            .style('font-size','1em')
            .style('font-weight',400)
            .text('Mean years of schooling')
            .style('fill', 'black');
    }

    function createBars(){
        d3.select('#v13_svg')
            .append("g")
            .attr('id', "vis-pop-bar2").attr('class', 'pop')
            .attr("transform", "translate("+(margin+(w-margin)/3)+"," + margin +")");

        d3.select('#vis-pop-bar2')
            .selectAll('rect')
            .data(selection)
            .enter()
            .append('rect')
            .attr('x', function(d){
                return padding + xScale(d['Country/Region']);
            })
            .attr('y', function(d){
                return yScale(d['Mean years of schooling']);
            })
            .attr('width', 20)
            .attr('height', function(d){
                return h-2*margin- yScale(d['Mean years of schooling']);
            })
            .style('fill', 'rgb(106,169,205')
            .style('stroke', 'grey')
            .append('svg:title')
            .text(function(d){
                return d['Literacy rate(%)'];
            });
    }

    function getCountries(){
        var countries = [];
        selection.forEach(function(e){
            countries.push(e['Country/Region']);
        })
        return countries;
    }
}

function createBarChart3(){
    var w = d3.select('#v13_svg').node().getBoundingClientRect().width !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().width : WIDTH;
    var h = d3.select('#v13_svg').node().getBoundingClientRect().height !== undefined ?
        d3.select('#v13_svg').node().getBoundingClientRect().height : HEIGHT;

    const margin = 150,
        padding = 10;
    let yScale = d3.scaleLinear()
        .domain([0,30])
        .range([h-2*margin,0]);

    let xScale = d3.scaleBand()
        .domain(getCountries())
        .rangeRound([0, (w-margin)/3.0-margin])
        .padding(0.2);

    let xAxis, yAxis;
    createBars();

    setUpAxis();

    function setUpAxis(){
        xAxis = d3.axisBottom(xScale)
            .ticks(getCountries());
        yAxis = d3.axisLeft(yScale)
            .ticks(6)
            .tickPadding(10);

        d3.select('#v13_svg').append('g').attr('id', 'bar3-x').attr('class', 'pop')
            .attr('transform', "translate("+(margin+2*(w-margin)/3) +"," + (h-margin) +")")
            .call(xAxis)
            .selectAll('text')
            .attr('x', 10)
            .attr('transform','rotate(45)')
            .attr('text-anchor', 'start')
            .style('alignment-baseline', 'middle')
            .style('fill', 'black');

        d3.select('#v13_svg').append('g').attr('id', 'bar3-y').attr('class', 'pop')
            .attr('transform', "translate("+(margin+2*(w-margin)/3) +"," + margin +")")
            .call(yAxis);

        d3.select('#bar3-y').append('text')
            .attr('x', margin)
            .attr('y', h/2.0)
            .attr('transform', `rotate(-90, -50, ${h/2.0})`)
            .style('text-anchor', 'middle')
            .style('font-size','1em')
            .style('font-weight',400)
            .text('Share of education in governmental expenditure (%)')
            .style('fill', 'black');
    }

    function createBars(){
        d3.select('#v13_svg')
            .append("g")
            .attr('id', "vis-pop-bar3").attr('class', 'pop')
            .attr("transform", "translate("+(margin+2*(w-margin)/3)+"," + margin +")");

        d3.select('#vis-pop-bar3')
            .selectAll('rect')
            .data(selection)
            .enter()
            .append('rect')
            .attr('x', function(d){
                return padding + xScale(d['Country/Region']);
            })
            .attr('y', function(d){
                return yScale(d['Share of education in governmental expenditure (%)']);
            })
            .attr('width', 20)
            .attr('height', function(d){
                return h-2*margin- yScale(d['Share of education in governmental expenditure (%)']);
            })
            .style('fill', 'rgb(106,169,205')
            .style('stroke', 'grey')
            .append('svg:title')
            .text(function(d){
                return d['Literacy rate(%)'];
            });
    }

    function getCountries(){
        var countries = [];
        selection.forEach(function(e){
            countries.push(e['Country/Region']);
        })
        return countries;
    }
}

function createBrushing(){

    addListeners();

    function addListeners(){
        d3.select('#vis-pop-bar1')
            .selectAll('rect')
            .on('mouseover', function(d){
                onMouseOverBar(d);
            })
            .on('mousemove', function(d){
                onMouseMoveBar(d);
            })
            .on('mouseout', function(d){
                onMouseOutBar(d);
            });

        d3.select('#vis-pop-bar2')
            .selectAll('rect')
            .on('mouseover', function(d){
                onMouseOverBar(d);
            })
            .on('mousemove', function(d){
                onMouseMoveBar(d);
            })
            .on('mouseout', function(d){
                onMouseOutBar(d);
            });

        d3.select('#vis-pop-bar3')
            .selectAll('rect')
            .on('mouseover', function(d){
                onMouseOverBar(d);
            })
            .on('mousemove', function(d){
                onMouseMoveBar(d);
            })
            .on('mouseout', function(d){
                onMouseOutBar(d);
            });
    }

    function onMouseOverBar(data){
        d3.select('#vis-pop-bar1')
            .selectAll('rect')
            .select(function(d){
                if(d['Country/Region'] === data['Country/Region']){
                    return this;
                }
                return null;
            })
            .style("fill", "rgb(236,236,236)")
            .style("stroke", "black")
            .style("stroke-width", "2px");

        d3.select('#vis-pop-bar2')
            .selectAll('rect')
            .select(function(d){
                if(d['Country/Region'] === data['Country/Region']){
                    return this;
                }
                return null;
            })
            .style("fill", "rgb(236,236,236)")
            .style("stroke", "black")
            .style("stroke-width", "2px");

        d3.select('#vis-pop-bar3')
            .selectAll('rect')
            .select(function(d){
                if(d['Country/Region'] === data['Country/Region']){
                    return this;
                }
                return null;
            })
            .style("fill", "rgb(236,236,236)")
            .style("stroke", "black")
            .style("stroke-width", "2px");

        popUp.select('.country').html("Country/Region: <b>" + data['Country/Region'] + "</b>");
        popUp.select('.literacy').html("Literacy rate: <b>" + data['Literacy rate(%)'] + "%</b>");
        if(data['Mean years of schooling'] === "") popUp.select('.schooling').html("Mean Year of Schooling: <b>Not Available</b>");
        else popUp.select('.schooling').html("Mean Year of Schooling: <b>" + data['Mean years of schooling'] + " years</b>");
        if(data['Share of education in governmental expenditure (%)'] === "")popUp.select('.expenditure').html("Share of education in governmental expenditure: <b>Not Available</b>");
        else popUp.select('.expenditure').html("Share of education in government expenditure: <b>" + data['Share of education in governmental expenditure (%)'] + "%</b>");

        popUp.style("background", 'rgb(236,236,236)');
        popUp.style('display', 'block');
        popUp.style('opacity', 0.8);
    }
    function onMouseMoveBar(data){
        popUp.style('left', (d3.event.layerX - 25) + 'px')
            .style('top', (d3.event.layerY + 10) + 'px');
    }
    function onMouseOutBar(data){
        d3.select('#vis-pop-bar1')
            .selectAll('rect')
            .select(function(d){
                if(d['Country/Region'] === data['Country/Region']){
                    return this;
                }
                return null;
            })
            .style("fill", "rgb(106,169,205")
            .style("stroke", "grey")
            .style("stroke-width", "1px");

        d3.select('#vis-pop-bar2')
            .selectAll('rect')
            .select(function(d){
                if(d['Country/Region'] === data['Country/Region']){
                    return this;
                }
                return null;
            })
            .style("fill", "rgb(106,169,205")
            .style("stroke", "grey")
            .style("stroke-width", "1px");

        d3.select('#vis-pop-bar3')
            .selectAll('rect')
            .select(function(d){
                if(d['Country/Region'] === data['Country/Region']){
                    return this;
                }
                return null;
            })
            .style("fill", "rgb(106,169,205")
            .style("stroke", "grey")
            .style("stroke-width", "1px");
    }
}

function finishSelection(){
    if(selection.length > 10){
        alert("Too many selections!");
        return;
    }
    d3.select('#vis-pop')
        .style('display', 'block');
    createBarChart1();
    createBarChart2();
    createBarChart3();
    createBrushing();
}

function onMouseOver(d, selector){
    popUp.select('.country').html("Country/Region: <b>" + d['Country/Region'] + "</b>");
    popUp.select('.literacy').html("Literacy rate: <b>" + d['Literacy rate(%)'] + "%</b>");
    if(d['Mean years of schooling'] === "") popUp.select('.schooling').html("Mean Year of Schooling: <b>Not Available</b>");
    else popUp.select('.schooling').html("Mean Year of Schooling: <b>" + d['Mean years of schooling'] + " years</b>");
    if(d['Share of education in governmental expenditure (%)'] === "")popUp.select('.expenditure').html("Share of education in governmental expenditure: <b>Not Available</b>");
    else popUp.select('.expenditure').html("Share of education in government expenditure: <b>" + d['Share of education in governmental expenditure (%)'] + "%</b>");

    var bgd_color = "#666666";
    if(d['Share of education in governmental expenditure (%)'] !== ""){
        bgd_color = colorScale(d['Share of education in governmental expenditure (%)']);
    }
    popUp.style("background", bgd_color);

    d3.select(selector)
        .style("fill", "#FFFFFF")
        .style("stroke", "#000000")
        .style("stroke-width", "2px");

    popUp.style('display', 'block');
    popUp.style('opacity', 0.8);
}

function arrayRemove(arr, value){
    return arr.filter(function(ele){
        return ele !== value;
    });
}

function onMouseClick(d, selector){
    if(d.isSelected === undefined || d.isSelected === false){
        d.isSelected = true;
        d3.select(selector)
            .style("fill", "#FFFFFF")
            .style("stroke", "#000000")
            .style("stroke-width", "2px");
        selection.push(d);
        if(selection.length === 1){
            d3.select('#selectionBtn')
                .style('display', 'block');
            d3.select('#btnText')
                .style('display', 'block');
        }
    }else if(d.isSelected === true){
        d.isSelected = false;
        selection = arrayRemove(selection, d);
        if(selection.length === 0){
            d3.select('#selectionBtn')
                .style('display', 'none');
            d3.select('#btnText')
                .style('display', 'none');
        }
        d3.select(selector)
            .style("fill", function(d){
                if(d['Share of education in governmental expenditure (%)'] !== "")
                    return colorScale(d['Share of education in governmental expenditure (%)']);
                else return "#666666";
            }).style("stroke", "grey")
            .style("stroke-width", "0")
            .style("opacity", 0.7);
    }
}

function onMouseOut(d, selector){
    if(d.isSelected === undefined || d.isSelected === false){
        d3.select(selector)
            .style("fill", function(d){
                if(d['Share of education in governmental expenditure (%)'] !== "")
                    return colorScale(d['Share of education in governmental expenditure (%)']);
                else return "#666666";
            }).style("stroke", "grey")
            .style("stroke-width", "0")
            .style("opacity", 0.7);
    }

    popUp.style('display', 'none');
    popUp.style('opacity', 0);
}

function onMouseMove(d){
    popUp.style('left', (d3.event.layerX - 25) + 'px')
        .style('top', (d3.event.layerY + 10) + 'px');
}

function setupVis3() {
    d3.csv("worldwide-literacy.csv").then(function(data){
        setSpiral3(data);
    })
}
