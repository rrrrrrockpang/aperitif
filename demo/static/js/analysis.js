/**
 * A series of UI and functionality for analysis (Q5) in AsPredicted
 * The current test selection does not support more than one independent variable in one hypothesis
 * because Tea does not support such reasoning.
 * However, current version is under development for more comprehensive test compatibility
 */
const ANALYSIS_ID = "analysis";
const ANALYSIS_PLUGIN_ID = ANALYSIS_ID + "_aperitif";
const ANALYSIS_BTN_ID = ANALYSIS_ID + "_initial_btn";
const ANALYSIS_TEXTAREA_NODE = $("[name='text4']");
const ANALYSIS_PARENT_SECTION = ANALYSIS_TEXTAREA_NODE.parent().parent().parent();
 
const ANALYSIS_DESCRIPTION = "Specify Hypotheses between dependent and independent Variables by clicking the variables of your interest.";

analysisIVClicked = false;
analysisIV = null;
analysisIVElement = null;

analysisDVClicked = false;
analysisDV = null;
analysisDVElement = null;

let methodName = null;

// TODO: Add logic here
const addAnalysisAperitif = () => {
    const aperitif = createAperitifForm75(ANALYSIS_PLUGIN_ID, ANALYSIS_DESCRIPTION);
    aperitif.append(addArrow());
    ANALYSIS_PARENT_SECTION.prepend(aperitif);
    // aperitif.hide();

    const displayArea = aperitif.find(".displayarea");
    const container = createAnalysisTwoColumnsForm();
    displayArea.append(container);
}

const createAnalysisTwoColumnsForm = () => {
    return $(`<div class='container'>
                <div class="row">
                    <div class="col-sm-6">
                        <p style="text-align: center">Dependent Variables</p>
                        <div class="hypothesis-dv"></div>
                    </div>
                    <div class="col-sm-6">
                        <p style="text-align: center">Independent Variables</p>
                        <div class="hypothesis-iv"></div>
                    </div>
                </div>
            </div>`);
}

hypothesisPairListener = {
    pInternal: hypothesisPair,
    pListener: function (val) {},
    set pair(val) {
        this.pInternal = val;
        this.pListener(val);
    },
    get pair() {
        return this.pInternal;
    },
    registerListener: function (listener) {
        this.pListener = listener;
    }
}

hypothesisPairListener.registerListener(function(pair) {
    const inputArea = $(`#analysis_aperitif .inputarea`);
    inputArea.empty();

    if(pair['dv'] !== null && pair['iv'] !== null) {
        pair['iv'].setAssumptions(pair['dv']);
        updateHypothesisFormArea(inputArea);
    } else {
        inputArea.append("Please choose a dependent variable and a condition.");
    }
})


// Modal for the assumption modal
const addAssumptionModal = (body) => {
    const modal = $(`
        <div class="modal fade" id="assumptionModal" tabindex="-1" role="dialog" aria-labelledby="assumptionModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                     <h5 class="modal-title" id="assumptionModalLabel"></h5>
                     <button type="button" class="btn btn-light close" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                     </button>
                  </div>
                  <div class="modal-body">  
                    <div class="form-group">
                        Please check the assumptions. Don't worry if you don't have any assumptions of the data at this stage. Apéritif will use non-parametric statistical analysis. 
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="assumption-independence" name="independence">
                        <label for="assumption-independence"><a href="https://www.statisticshowto.com/assumption-of-independence/" target="_blank">Independence</a></label> <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="The assumption of independence means that your data isn’t connected in any way"></span><br>
                        <input type="checkbox" id="assumption-normality" name="normality">
                        <label for="assumption-normality"><a href="https://www.statisticshowto.com/assumption-of-normality-test/" target="_blank">Normality</a></label> <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="The assumption of independence means that your data roughly fits a bell curve shape."></span><br>
                        <input type="checkbox" id="assumption-equalvariance" name="equalvariance">
                        <label for="assumption-equalvariance"><a href="https://www.statisticshowto.com/homoscedasticity/" target="_blank">Equal Variance</a></label> <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="The assumption of equal variance (homoscedasticity) means that different samples have the same variance."></span><br>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="save btn btn-success" data-bs-dismiss="modal">Save</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  </div>
                </div>
            </div>
        </div>
    `);

    body.append(modal);
    $("#assumptionModal .save.btn").on("click", function() {
        let isIndependence = $("#assumption-independence").prop("checked");
        let isNormal = $("#assumption-normality").prop("checked");
        let isEqualVariance = $("#assumption-equalvariance").prop("checked");

        for(let i = 0; i < globalIVs.length; i++) {
            if(currentAssumptionVariable.name === globalIVs[i].name) {
                globalIVs[i].setAssumptions(analysisDV, isNormal, isIndependence, isEqualVariance);
                break;
            }
        }
        $(this).find("input[type=checkbox]").prop("checked", "");

        currentAssumptionVariable = null;
        $(`#analysis_aperitif .inputarea`).empty();
        updateHypothesisFormArea($(`#analysis_aperitif .inputarea`));
        $('#assumptionModal').modal('hide')
    });
}

// Layout for the variables in the hypothesis question
const addHypothesisCard = (text, id) => {
    return $(`
        <div class="hypothesis-card" id="${id}">
            <p>${text}</p>
        </div>
    `);
}

// Add event listner for the hypothesis card
// Update the currently selected dv and iv
// Note that Aperitif can only support one iv at a time 
const addHypothesisCardEventListener = (card, variable) => {
    card.css("background", "grey");
    if(variable.section === DEPENDENT_VARIABLE_ID) {
        if(analysisDVClicked) {
            analysisDVElement.css("background", "none");
            if(analysisDV.name === variable.name) {
                analysisDVClicked = false; 
                analysisDVElement = null;
                analysisDV = null;
                hypothesisPair['dv'] = null;
            } else {
                analysisDVClicked = true;
                analysisDVElement = card;
                analysisDV = variable; 
                hypothesisPair['dv'] = analysisDV;
            }
        } else {
            analysisDVClicked = true;
            analysisDVElement = card;
            analysisDV = variable;
            hypothesisPair['dv'] = analysisDV;
        }
        hypothesisPairListener.pair = hypothesisPair;
    } else {
        if(analysisIVClicked) {
            analysisIVElement.css("background", "none");
            if(analysisIV.name === variable.name) {
                analysisIVClicked = false;
                analysisIVElement = null;
                analysisIV = null;
                hypothesisPair['iv'] = null;
            } else {
                analysisIVClicked = true;
                analysisIVElement = card;
                analysisIV = variable;
                hypothesisPair['iv'] = analysisIV;
            }
        } else {
            analysisIVClicked = true;
            analysisIVElement = card;
            analysisIV = variable;
            hypothesisPair['iv'] = analysisIV;
        }
        hypothesisPairListener.pair = hypothesisPair;
    }
}

// Update variable functions
const updateVariableInAnalysis = (displayArea, variables) => {
    let cards = [];
    selectedIV = [];

    for(let i = 0; i < variables.length; i++) {
        const card = addHypothesisCard(variables[i].display_name, variables[i].card_id);
        card.on("click", ":not(.assumptions-update)", function() {
            addHypothesisCardEventListener(card, variables[i]);
        });

        if(globalIVs.filter(e => e.name === variables[i].name).length > 0) {
            card.append(`<a class="assumptions-update">Update Assumptions</a>`);
            card.find(".assumptions-update").on("click", function() {
                if(analysisIV === null) {
                    alert("Please select a dependent variable in your hypothesis formation process.");
                    return;
                }
                if(analysisDV === null) {
                    alert("Please select a dependent variable in your hypothesis formation process.");
                    return;
                }
                currentAssumptionVariable = variables[i];
                let dv_name = analysisDV;
                let assumptions = variables[i].assumption[dv_name.name];
                if(assumptions.independence) {
                    $("#assumptionModal #assumption-independence").prop("checked", true);
                }
                if(assumptions.normality) {
                    $("#assumptionModal #assumption-normality").prop("checked", true);
                }
                if(assumptions.homoscedasticity) {
                    $("#assumptionModal #assumption-equalvariance").prop("checked", true);
                }
                $("#assumptionModal").modal("toggle");
            })
        }
        cards.push(card);
    }
    displayArea.html(cards);
}

const addListenerToGenerateHypothesis = (methodDisplay, dv, iv, meanOrMedian, method) => {
    methodDisplay.find("button").on("click", function() {
        if(!confirm("Please make sure you'd like to generate hypothesis based on this study design.")) {
            return;
        }
        if(iv.type === "nominal") {
            // Comparison relationship
            // Check whether the hypothesis test is two sided
            let selectedSide = $(".two-side").find(":selected").val();
            let cat1 = $(`.iv-group-custom-select-1 option:selected`).val();
            let cat2 = $('.iv-group-custom-select-2 option:selected').val();

            let twoSide = true; 
            if (selectedSide === "greater" || selectedSide === "less") {
                twoSide = false;
            } // else twoSide = true;

            // organize the text presentation order 
            if(selectedSide === 'less') {
                let temp = cat2;
                cat2 = cat1;
                cat1 = temp;
            }

            relKey = { // relationship key
                'iv_type': "nominal",
                "two_side": twoSide,
                "categories": [cat1, cat2]
            }
            if(iv.categories.length > 2) {
                $("#cohen").text("f");
                $("#small-effect").val(0.1);
                $("#small-effect-label").text(0.1);
                $("#medium-effect").val(0.25);
                $("#medium-effect-label").text(0.25);
                $("#large-effect").val(0.4);
                $("#large-effect-label").text(0.4);
                cohen = "f"
            }
        } else {
            // Correlation relationship. Ordinal variable will always use non-parametric Kendall's tau/Spearman's rho
            let positive = false;
            let posNeg = $('.positive-negative option:selected').val();
            if(posNeg) positive = true;
            relKey = {
                'iv_type' : iv.type,
                'positive': positive
            }

            
            $("#sample-form-group").hide();
            $("#correlation-body").show();
            $("#pilot-study").hide();
        }

        updateTeaCodeHypothesis(dv, iv, relKey);
        updateAnalysisTextArea(dv, iv, relKey, meanOrMedian, method);
    });
}

const updateAnalysisTextArea = (dv, iv, relKey, meanOrMedian, method) => {
    let newText = "";

    for(let i = 0; i < report.hypothesis.length; i++) {
        const iv = report.hypothesis[i][0][0], dv = report.hypothesis[i][0][1];
        
        // This prototype almost guarantees this situation.
        // But what about more complex models?
        if(iv.type === 'nominal') { 
            let compare;
            if(report.hypothesis[i][1][0] === "!=") compare = "different from";
            else if(report.hypothesis[i][1][0] === ">") compare = "greater than";
            else compare = "same as";
            // TODO: fix this.
            newText += `H${i+1}: The ${meanOrMedian} value of ${dv.display_name} in ${report.hypothesis[i][1][1]} group will be ${compare} that in ${report.hypothesis[i][1][2]}. `;
            newText += `We will analyze this hypothesis with ${method}. See the reproducible statistical code for the analysis after data collection.`;
        } else {
            const pos = report.hypothesis[i][1][0];
            if(pos === "~") {
                newText += `H${i+1}: The greater value of ${iv.display_name} will lead to greater value of ${dv.display_name}.`;
            } else {
                newText += `H${i+1}: The greater value of ${iv.display_name} will lead to less value of ${dv.display_name}.`;
            }
            newText += `We will analyze this hypothesis with a ${method} statistical test. See the reproducible statistical code for the anlaysis after data collection. `
        }
        newText += "\n";
    }

    ANALYSIS_TEXTAREA_NODE.val(newText);
}


const updateHypothesisFormArea = (inputArea) => {
    let dv = hypothesisPair['dv'];
    let iv = hypothesisPair['iv'];
    // Decide method and the specific wordings
    let meanOrMedian = "median";
    let method = decideMethod(dv, iv);
    methodName = method; 
    if(IsParametricDic[method]) {
        meanOrMedian = "mean";
    } else {
        meanOrMedian = "median";
    }
    // TODO!!
    if(iv.type === 'nominal') hypothesisFormArea = createHypothesisIVIsNominal(dv, iv, method, meanOrMedian);
    else hypothesisFormArea = createHypothesisIVIsNotNominal(dv, iv, method);
    inputArea.append(hypothesisFormArea);

    methodDisplay = $(`
                        <br>
                        <div class="container text-center"> 
                            <div class="row">
                                <div class="col-sm-8" style="border: 1.5px dashed #5cb85c"><strong>Statistical Tests:</strong> <br/> ${method}</div>
                                <div class="col-sm-4"><button id="generate-hypothesis" type='button' class='btn btn-success submit'>Generate a Hypothesis</button></div>
                            </div>
                        </div>`);
    inputArea.append(methodDisplay);
    $("#meanorMedianinHypothesis").text(meanOrMedian);
    addListenerToGenerateHypothesis(methodDisplay, dv, iv, meanOrMedian, method);
}

// Create the text section for the hypothesis section
const createHypothesisIVIsNominal = (dv, iv, method, meanOrMedian) => {
    const template = $(`
        <form class='hypothesis_display_form'>
            <div class="form-group">
                <label for='name' class='col-form-label'>Hypothesis:</label>
                <div class="form-inline">
                    <label>The <span id="meanorMedianinHypothesis">${meanOrMedian}</span> value of</label>
                    <label class="dv-in-form"></label>
                    <label>in</label>
                    <select class="iv-group-custom-select-1">
                    </select>
                    <label>group will be</label>
                    <select class="custom-select two-side">
                        <option value="greater">greater than</option>
                        <option value="less">less than</option>
                        <option value="different">different from</option>
                        <option value="same">same as</option>
                    </select>
                    <label>that in</label>
                    <select class="iv-group-custom-select-2">
                    </select>
                    .
                    <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title=""Aperitif uses a conservative nonparametric approach when preregistering your study. If you are confident that the hypothesis testing is parametric, Aperitif will compare the mean values."></span>
                </div>
            </div>

            <div class="justification"></div>
    `);

    // Populate options for dependent and independent variable choices
    template.find(".dv-in-form").append($(`<strong>${dv.name}</strong>`));
    let categoryOptions = [], categoryOptions2 = [];
    for(let i = 0; i < iv.categories.length; i++) {
        const option = $(`<option value="${iv.categories[i]}">${iv.categories[i]}</option>`);
        categoryOptions.push(option);
        categoryOptions2.push(option.clone());
    }
    // Default selection
    categoryOptions[0].prop("selected", true);
    categoryOptions2[1].prop("selected", true);
    // Insert into the jquery object
    template.find(".iv-group-custom-select-1").html(categoryOptions);
    template.find(".iv-group-custom-select-2").html(categoryOptions2);

    return template;
}


const createHypothesisIVIsNotNominal = (dv, iv, method, meanOrMedian) => {
    const template = $(`
                <form class='hypothesis_display_form'>
                    <div class="form-group">
                        <label for='name' class='col-form-label'><strong>Hypothesis:</strong>
                        <div class="form-inline" style="display: inline-block;">
                            <label>The greater value of</label>
                            <label class="iv-in-form mr-sm-2"></label>
                            <label>will lead to a </label>
                            <select class="custom-select positive-negative">
                                <option value="greater" selected>greater</option>
                                <option value="less">less</option>
                                <option value="different">different</option>
                                <option value="same">the same</option>
                            </select>
                            value of <label class="dv-in-form"></label>.
                        </div>
                    </div>
                </form>
            `);
    template.find(".dv-in-form").append(dv.name);
    template.find(".iv-in-form").append(iv.name);
    return template;
}