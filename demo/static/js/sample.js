const SAMPLE_SIZE_ID = "sample_size";
const SAMPLE_SIZE_PLUGIN_ID = SAMPLE_SIZE_ID + "_preregistea";
const SAMPLE_SIZE_BTN_ID = SAMPLE_SIZE_ID + "_initial_btn";
const SAMPLE_SIZE_TEXTAREA_NODE = $("[name='text6']");
const SAMPLE_SIZE_PARENT_SECTION = SAMPLE_SIZE_TEXTAREA_NODE.parent().parent().parent();

const SAMPLE_SIZE_DESCRIPTION = "Fill in the effect size and visualize how many participants you need to recruit.";

let studySampleSize, studyEffectSize; 

// graph defaults
const margin = {top: 10, right: 30, bottom: 40, left: 60},
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

const x = d3.scaleLinear()
        .domain([5, 100])
        .range([ 0, width ]);

const y = d3.scaleLinear()
        .domain([0, 1])
        .range([ height, 0 ]);


const addSampleSizeAperitif = () => {
    const aperitif = createAperitifForm75(SAMPLE_SIZE_PLUGIN_ID, SAMPLE_SIZE_DESCRIPTION);
    aperitif.append(addArrow());
    SAMPLE_SIZE_PARENT_SECTION.prepend(aperitif);

    const displayArea = aperitif.find(".displayarea");
    const inputArea = aperitif.find(".inputarea");
    
    inputArea.append(createSampleInput());
    displayArea.append(createPowerChart());
    createSampleBtn();
}

const createSampleInput = () => {
    return $(`<form class='inputarea-form'>
                        <div class="form-group">
                            <div class="form effect-radio">
                                <label for="effectSizeNumber">Cohen's <i>d</i> &nbsp;
                                    <input type="number" id="effectSizeNumber" name="effectSizeNumber" min="0" max="0.99" step="0.05" value="" size="4">
                                    with a margin of &#177;
                                    <input type="number" id="confidenceInterval" name="confidenceInterval" min="0" value="0.05" step="0.01" size="1">
                                </label>
                                <br/><br/>
                                <div class="form-check">
                                    <label class='form-check-label'><input class='form-check-input' type='radio' name='effectSizeRadios' value='0.2'>
                                        Small Effect (0.2)
                                    </label>
                                </div>
                                <div class="form-check">
                                    <label class='form-check-label'><input class='form-check-input' type='radio' name='effectSizeRadios' value='0.5'>
                                        Medium Effect (0.5)
                                    </label>
                                </div>
                                <div class="form-check">
                                    <label class='form-check-label'><input class='form-check-input' type='radio' name='effectSizeRadios' value='0.8'>
                                        Large Effect (0.8)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                    <button id="sample-size-button" type="button" class="btn btn-lg btn-block btn-success" style="position: absolute; bottom: 10px; right: 10px">OK</button>`);
}

const createSampleBtn = () => {
    $("#sample-size-button").on("click", function() {
        if(studySampleSize === 0) {
            alert("You might want to avoid effect size that's too big or too small.");
            return;
        }
        updateSampleSizeTextArea(studyEffectSize, studySampleSize);
    });
}

const updateSampleSizeTextArea = (es, sampleSize) => {
    newText = `A prospective power analysis was performed for sample size determination based on Cohen's conventional effect size d = ${es}. We achieved a statistical power of at least 0.8 under α = 0.05 within ${sampleSize} participants per condition.`;
    SAMPLE_SIZE_TEXTAREA_NODE.val(newText);
}


// Create power chart
const createPowerChart = (e = 0.8) => {
    const display = $(`<div class="power-analysis"></div>`);
    let graph = d3.select(display[0]);
    // Add initial layout template
    const svg = graph.append("svg")
        .attr("width", width + 200 + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    svg.append("g")
        .call(d3.axisLeft(y));
    // Add dash line
    svg.append("line")
        .attr("class", "reference")
        .style("stroke", "red")
        .style("stroke-dasharray", ("3, 3"))
        .attr("x1", 0)
        .attr("y1", y(0.8))
        .attr("x2", width)
        .attr("y2", y(0.8));
    svg.append("text")             
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Number of Participants");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Statistical Power");   

    function update(number, confidence=0.05) {
        (async () => {
            d3.selectAll(".power-line").remove();

            let focus = svg
                .append('g')
                .append('circle')
                .style("fill", "none")
                .attr("class", "power-line")
                .attr("stroke", "black")
                .attr('r', 4)
                .style("opacity", 0);

            let focusText = svg
                .append('g')
                .append('text')
                .style("opacity", 0)
                .attr('class', 'power-line')
                .attr("text-anchor", "left")
                .attr("alignment-baseline", "middle");

            svg.append('rect')
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr('class', 'power-line')
                .attr('width', width)
                .attr('height', height)
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);

            const filtered = await df(number, confidence);
            svg.append("path") // Confidence Interval
                .datum(filtered)
                .attr("class", "power-line")
                .attr("fill", "#69b3a2")
                .attr("fill-opacity", .3)
                .attr("stroke", "none")
                .attr("d", d3.area()
                    .x(function (d) {
                        return x(d.sample)
                    })
                    .y0(function (d) {
                        return y(d.lower)
                    })
                    .y1(function (d) {
                        return y(d.higher)
                    })
                )

            svg.append('g').append("path")
                .datum(filtered)
                .attr("class", "power-line")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) {
                        return x(d.sample)
                    })
                    .y(function (d) {
                        return y(d.power)
                    })
                );

            function mouseover() {
                focus.style("opacity", 1)
                focusText.style("opacity", 1)
            }

            function mousemove(event) {
                // recover coordinate we need
                var x0 = x.invert(d3.pointer(event)[0]);
                var i = bisect(filtered, x0, 1);
                selectedData = filtered[i]
                focus
                    .attr("cx", x(+selectedData.sample))
                    .attr("cy", y(+selectedData.power))
                focusText
                    .html("Size:" + selectedData.sample + "  -  " + "Power:" + Math.round(selectedData.power * 100) / 100)
                    .attr("x", x(+selectedData.sample) + 15)
                    .attr("y", y(+selectedData.power))
            }

            function mouseout() {
                focus.style("opacity", 0)
                focusText.style("opacity", 0)
            }
        })();
    }

    d3.select("#generate-hypothesis").on("click", function(d) {
        // initial visualization 
        update(0.8); // default effect size = 0.8
    });

    d3.select("#effectSizeNumber").on("change", function(d) {
        const effectSize = parseFloat($("#effectSizeNumber").val());
        const confidenceInterval = parseFloat($("#confidenceInterval").val());
        (async () => {
            const powers = await df(effectSize, confidenceInterval);
            let finalSampleSize = 0;
            for(let i = 0; i < powers.length - 1; i++) {
                if(powers[i].power < 0.8 && powers[i+1].power > 0.8) {
                    finalSampleSize = powers[i+1].sample;
                    break
                }
            }
            studySampleSize = finalSampleSize;
            studyEffectSize =  effectSize;

            let number = d3.select("#effectSizeNumber").property("value");
            update(parseFloat(number), confidenceInterval);
        })();
    });

    d3.selectAll(".effect-radio input[type='radio']").on("change", function(d) {
        const effectSize = parseFloat(d3.select(".effect-radio input[type='radio']:checked").property("value"));
        const confidenceInterval = parseFloat($("#confidenceInterval").val());
        $("#effectSizeNumber").val(effectSize);
        
        (async () => {
            const powers = await df(effectSize, confidenceInterval);
            let finalSampleSize = 0;
            for(let i = 0; i < powers.length - 1; i++) {
                if(powers[i].power < 0.8 && powers[i+1].power > 0.8) {
                    finalSampleSize = powers[i+1].sample;
                    break
                }
            }
            studySampleSize = finalSampleSize;
            studyEffectSize =  effectSize;
            
            update(effectSize, confidenceInterval);
        })();
    });

    d3.select("#confidenceInterval").on("change", function(d) {
        const effectSize = parseFloat($("#effectSizeNumber").val());
        confidenceInterval = parseFloat($("#confidenceInterval").val());
        
        (async () => {
            const powers = await df(effectSize, confidenceInterval);
            let finalSampleSize = 0;
            for(let i = 0; i < powers.length - 1; i++) {
                if(powers[i].power < 0.8 && powers[i+1].power > 0.8) {
                    finalSampleSize = powers[i+1].sample;
                    break
                }
            }
            studySampleSize = finalSampleSize;
            studyEffectSize =  effectSize;
            
            update(effectSize, confidenceInterval);
        })();
    })

    return display;
}

var bisect = d3.bisector(function(d) { return d.sample; }).left;
const df = async (effectSize, confidence = 0.05, alpha=0.05) => { // TODO: add a condition statement
    const result = await decideSamples(effectSize, confidence, alpha, methodName);
    return result['data'];
}