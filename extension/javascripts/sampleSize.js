const SAMPLE_SIZE_ID = "sample_size";
const SAMPLE_SIZE_PLUGIN_ID = SAMPLE_SIZE_ID + "_preregistea";
const SAMPLE_SIZE_BTN_ID = SAMPLE_SIZE_ID + "_initial_btn";
const SAMPLE_SIZE_TEXTAREA_NODE = $("[name='text6']");
const SAMPLE_SIZE_PARENT_SECTION = SAMPLE_SIZE_TEXTAREA_NODE.parent().parent().parent();

const SAMPLE_SIZE_DESCRIPTION =
    "Fill in the effect size and visualize how many participants you need to recruit."

const DEFAULT_EFFECT_SIZE = 0.8;
let studyEffectSize = 0.8;
let studySampleSize = 13;
let confidenceInterval = 0.05;

// graph defaults
const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 500 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

const x = d3.scaleLinear()
        .domain([5, 100])
        .range([ 0, width ]);

const y = d3.scaleLinear()
        .domain([0, 1])
        .range([ height, 0 ]);

const calcPower = (sample, effect, alpha=0.05, two_side=2.0) => {
    // console.log(alpha, two_side, effect, sample);
    effect = 2 * effect.toFixed(3)
    let zval = normal_quantile(alpha/two_side) + effect*Math.sqrt(sample);
    return normal_cdf(zval);
}

const addSampleSizePreregistea = () => {
    const preregistea = createPreregisteaForm(SAMPLE_SIZE_PLUGIN_ID, SAMPLE_SIZE_DESCRIPTION);
    preregistea.append(addArrow());
    SAMPLE_SIZE_PARENT_SECTION.prepend(preregistea);

    const inputarea = preregistea.find(".inputarea");
    const displayarea = preregistea.find(".displayarea");


    displayarea.append(createPowerChart());

    // const inputBtn = createAnalysisBtn();
    // inputarea.append(inputBtn);
}

const createPowerInputFormStandardizedMeanDiff = () => {
    // samplesSize = $(".effect-size-selection input[type='radio']:checked");
    // samplesSize.on("change", function(){
    //     alert("?1")
    // })

    const iv = hypothesisPair['iv'];
    const inputarea_form = $(`<form class='inputarea-form'>
                <div class="form-group">
                    <div class="row">
                        <div class="col-sm-3">Levels</div>
                        <div class="col-sm-3">Mean</div>
                        <div class="col-sm-3">Standard Deviation</div>
                    </div>
                </div>
            </form>`);

    for(let i = 0; i < iv.categories.length; i++) {
        inputarea_form.find(".form-group").append(`
            <div class="row">
                <div class="col-sm-3">${iv.categories[i]}</div>
                <div class="col-sm-3"><input class="standard-input standard-mean" id="level_${i}_mean" type="number"></div>
                <div class="col-sm-3"><input class="standard-input standard-sd" id="level_${i}_sd" type="number" step="0.5"></div>
            </div>
        `)
    }

    return inputarea_form;
}

const createAnalysisBtn = () => {
    const initialBtn = createInitialButton(SAMPLE_SIZE_BTN_ID, "OK");
    initialBtn.on("click", function() {
        if(effectSize === "cohenf") {
            if(studySampleSize === 0) {
                alert("You might want to avoid effect size that's too big or too small.");
                return;
            }
            updateSampleSizeTextArea(studyEffectSize, studySampleSize);
        } else {
            studyEffectSize = calculateEffectSizeFromStandardized();
            $(".power-analysis").html(
                createPowerChart()
            );

            updateSampleSizeTextArea(studyEffectSize, studySampleSize);
        }

    });
    return initialBtn;
}

const calculateEffectSizeFromStandardized = () => {
    let f = 0;
    // let categories = hypothesisPair["iv"].categories;
    let means = [];
    let sds = [];

    $(".standard-mean").each(function() {
        means.push(parseFloat($(this).val()));
    });

    $(".standard-sd").each(function() {
        sds.push(parseFloat($(this).val()));
    });

    let pooled_s = 0;
    console.log("pooled_s");
    for(let i=0; i < sds.length; i++) {
        pooled_s += Math.pow(sds[i],2)
    }

    pooled_s = pooled_s/sds.length;
    pooled_s = Math.sqrt(pooled_s);
    console.log(pooled_s);

    let sum = 0;
    for(let i = 0; i < means.length; i++) {
        sum += means[i];
    }
    let average = sum / means.length;
    console.log(sum)
    console.log(means)
    console.log(average);

    let variance = 0;
    for(let i = 0; i < sds.length; i++) {
        variance += Math.pow(means[i] - average, 2);
    }

    variance = variance / means.length;
    f = Math.sqrt(variance) / pooled_s;
    return f;
}

const updateSampleSizeTextArea = (es, sampleSize) => {
    newText = `A prospective power analysis was performed for sample size determination based on Cohen's conventional effect size d = ${es}. We achieved at least 0.8 under α = 0.05 within ${sampleSize} participants per condition.`
    SAMPLE_SIZE_TEXTAREA_NODE.val(newText);
}

const createPowerInputForm = () => {
    return $(`<form class='inputarea-form'>
                        <div class="form-group">
    
                            <div class="form-inline effect-radio">
                                <label for="effectSizeNumber">Cohen's <i>d</i> &nbsp;
                                    <input type="number" id="effectSizeNumber" name="effectSizeNumber" min="0" max="0.99" step="0.05" value="0.8" size="4">
                                    with a margin of &#177;
                                    <input type="number" id="confidenceInterval" name="confidenceInterval" min="0" value="0.05" step="0.01" size="1">
                                </label>
                                <label class='form-check-label'><input class='form-check-input' type='radio' name='effectSizeRadios' value='0.2'>
                                    Small Effect (0.2)
                                </label>
                                <label class='form-check-label'><input class='form-check-input' type='radio' name='effectSizeRadios' value='0.5'>
                                    Medium Effect (0.5)
                                </label>
                                <label class='form-check-label'><input class='form-check-input' type='radio' name='effectSizeRadios' value='0.8' checked>
                                    Large Effect (0.8)
                                </label>
                            </div>
                            
                            <div class="sample-size-text-display" style="border-top: 1px solid black">
                            13 participants yield at least a power of 0.80 at the effect size Cohen's <i>d</i> = 0.8.
                            </div>
                        </div>
                    </form>`);
}

const createPowerChart = (e=0.8) => {
    const display = $(`<div class="power-analysis"></div>`)
    let graph = d3.select(display[0]);

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
                .style("opacity", 0)

            let focusText = svg
                .append('g')
                .append('text')
                .style("opacity", 0)
                .attr('class', 'power-line')
                .attr("text-anchor", "left")
                .attr("alignment-baseline", "middle")

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

    if(effectSize === "cohenf"){
        update(0.8);
    } else {
        update(studyEffectSize);
    }
    d3.select("#effectSizeNumber").on("change", function(d) {
        const effectSize = parseFloat($("#effectSizeNumber").val());
        confidenceInterval = parseFloat($("#confidenceInterval").val());
        
        (async () => {
            const powers = await df(effectSize, confidenceInterval);
            let sample_size = 0;
            for(let i = 0; i < powers.length - 1; i++) {
                if(powers[i].power < 0.8 && powers[i+1].power > 0.8) {
                    sample_size = powers[i+1].sample;
                    break
                }
            }
            studySampleSize = sample_size;
            studyEffectSize = effectSize;
            console.log(powers);
            if(powers[0].power > 0.8) {
            $(".sample-size-text-display").html("The effect size is too big.");
            } else if(studySampleSize === 0) {
                $(".sample-size-text-display").html("You might want to change to a bigger effect size.");
            } else {
                $(".sample-size-text-display").html(`${studySampleSize} participants yield at least a power of 0.80 at the effect size Cohen's <i>d</i> = ${studyEffectSize}.`)
            }

            $(".sample-size-text-display").show();

            let number = d3.select("#effectSizeNumber").property("value");
            update(parseFloat(number), confidenceInterval);
        })();
    })

    d3.select("#confidenceInterval").on("change", function(d) {
        const effectSize = parseFloat($("#effectSizeNumber").val());
        confidenceInterval = parseFloat($("#confidenceInterval").val());
        
        (async () => {
            const powers = await df(effectSize, confidenceInterval);
            let sample_size = 0;
            for(let i = 0; i < powers.length - 1; i++) {
                if(powers[i].power < 0.8 && powers[i+1].power > 0.8) {
                    sample_size = powers[i+1].sample;
                    break
                }
            }
            studySampleSize = sample_size;
            studyEffectSize = effectSize;

            if(powers[0].power > 0.8) {
            $(".sample-size-text-display").html("The effect size is too big.");
            } else if(studySampleSize === 0) {
                $(".sample-size-text-display").html("You might want to change to a bigger effect size.");
            } else {
                $(".sample-size-text-display").html(`${studySampleSize} participants yield at least a power of 0.80 at the effect size Cohen's <i>d</i> = ${studyEffectSize}.`)
            }

            $(".sample-size-text-display").show();

            let number = d3.select("#effectSizeNumber").property("value");
            update(parseFloat(number), confidenceInterval);
        })();
    })

    d3.selectAll(".standard-input").on("change", function(d) {
        let s = $(".standard-input");
        for(let i = 0; i < s.length; i++) {
            if(s[i] === "") return;
        }
    });

    d3.selectAll(".effect-radio input[type='radio']").on("change", function(d) {
        const effectSize = d3.select(".effect-radio input[type='radio']:checked").property("value");
        $("#effectSizeNumber").val(effectSize);
        confidenceInterval = parseFloat($("#confidenceInterval").val());
        
        (async () => {
            const powers = await df(parseFloat(effectSize), confidenceInterval);
            let sample_size = 0;
            for(let i = 0; i < powers.length - 1; i++) {
                if(powers[i].power < 0.8 && powers[i+1].power > 0.8) {
                    sample_size = powers[i+1].sample;
                    break
                }
            }
            studySampleSize = sample_size;
            studyEffectSize = effectSize;

            if(powers[0].power > 0.8) {
            $(".sample-size-text-display").html("The effect size is too big.");
            } else if(studySampleSize === 0) {
                $(".sample-size-text-display").html("You might want to change to a bigger effect size.");
            } else {
                $(".sample-size-text-display").html(`${studySampleSize} participants yield at least a power of 0.80 at the effect size Cohen's <i>d</i> = ${studyEffectSize}.`)
            }

            $(".sample-size-text-display").show();

            update(parseFloat(effectSize), confidenceInterval);
            })();
        // update(parseFloat(number));
    })

    return display;
}

// helper to find the data and confidence interval
// const filterNumber = (number) => {
//     let lower = power_data.filter(function(d) {
//         const n = number - 0.05;
//         return Math.abs(d.effect - n) < Number.EPSILON;
//     })
//
//     let higher = power_data.filter(function(d) {
//         const n = number + 0.05;
//         return Math.abs(d.effect - n) < Number.EPSILON;
//     })
//
//     let dataFilter = power_data.filter(function(d) {
//         return d.effect === number;
//     });
//
//     dataFilter = dataFilter.map(function(d, i) {
//         d.lower = lower[i].power;
//         d.higher = higher[i].power;
//         return d
//     })
//
//     return dataFilter;
// }


// helper
var bisect = d3.bisector(function(d) { return d.sample; }).left;
const API_SAMPLE_URL = 'http://127.0.0.1:5555/getSamples'
const decideSamples = async (effectSize, confidence, alpha, methodName) => {
    const input = {
        "effectSize": effectSize,
        "confidence": confidence,
        "alpha": alpha,
        "method": methodName
    }
    console.log(input);
    const response = await fetch(API_SAMPLE_URL, {
        method: "POST", 
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: JSON.stringify(input),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    if(!response.ok) {
        alert("Error: Something happened in the backend."); 
        const message = `An error has occured with sampling: ${response.status}`;
        throw new Error(message);
    }

    let result = await response.json();
    return result;
}

const df = async (effectSize, confidence = 0.05, alpha=0.05) => { // TODO: add a condition statement
    const result = await decideSamples(effectSize, confidence, alpha, method.method);
    return result['data'];
}

const updateEffectSize = (effectSize) => {
    let effectForm = null;
    if(effectSize === "standardized") {
        effectForm = createPowerInputFormStandardizedMeanDiff();
    } else if(effectSize === "cohenf") {
        effectForm = createPowerInputForm();
    }
    const inputarea = $("#sample_size_preregistea .inputarea");
    const inputBtn = createAnalysisBtn();

    effectForm.append(inputBtn);
    inputarea.html(effectForm);

    $(".power-analysis").html(
        createPowerChart()
    );
}

















