/**
 * A series of UI and functionality for analysis (Q5) in AsPredicted
 * The current test selection does not support more than one independent variable in one hypothesis
 * because Tea does not support such reasoning.
 * However, current version is under development for more comprehensive test compatibility
 */
const ANALYSIS_ID = "analysis";
const ANALYSIS_PLUGIN_ID = ANALYSIS_ID + "_preregistea";
const ANALYSIS_BTN_ID = ANALYSIS_ID + "_initial_btn";
const ANALYSIS_TEXTAREA_NODE = $("[name='text4']");
const ANALYSIS_PARENT_SECTION = ANALYSIS_TEXTAREA_NODE.parent().parent().parent();

const ANALYSIS_DESCRIPTION =
    "Specify Hypotheses between dependent and independent Variables by clicking the variables of your interest."

let effectSize = "";

let selectedIV = [];

let method = null;

// Default average value set to median for analysis 
// because both Aperitif and Tea are using conservative (nonparametric) tests 
// if no assumption is made 
meanOrmedian = "median"; 

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
    const inputArea = $(`#analysis_preregistea .inputarea`);
    inputArea.empty();

    if(pair['dv'] !== null && pair['iv'] !== null) {
        pair['iv'].setAssumptions(pair['dv']);
        updateHypothesisFormArea(pair, inputArea);
    } else {
        inputArea.append("Please choose a dependent variable and a condition.");
    }
})

// Deprecated code for multiple independent variable selection
// We discarded this option because Tea does not support reasoning for more independent variables
// However, current version is under development for more comprehensive test compatibility

// selectedIVListener = {
//     sivInternal: selectedIV,
//     sivListener: function(val) {},
//     set selectedIV(val) {
//         this.sivInternal = val;
//         this.sivListener(val);
//     },
//     get selectedIV() {
//         return this.sivInternal;
//     },
//     registerListener: function (listener) {
//         this.sivListener = listener;
//     }
// }

// selectedIVListener.registerListener(function(selected) {
//     const inputArea = $(`#analysis_preregistea .inputarea`);
//     inputArea.empty();
//
//     if(analysisDV != null && selected.length > 0) {}
//
// })

/**
 * Layout for analysis. Append a series of JQuery objects to the analysis section
 */
const addAnalysisPreregistea = () => {
    const preregistea = createPreregisteaForm(ANALYSIS_PLUGIN_ID, ANALYSIS_DESCRIPTION);
    preregistea.append(addArrow());
    ANALYSIS_PARENT_SECTION.prepend(preregistea);
    preregistea.hide();

    const displayArea = preregistea.find(".displayarea");
    const container = createAnalysisTwoColumnsForm();
    displayArea.append(container);

}

const updateVariableInAnalysis = (displayarea, variables) => {
    let cards = [];
    selectedIV = [];

    for(let i = 0; i < variables.length; i++) {
        const card = addHypothesisCard(variables[i].display_name, variables[i].card_id);
        card.on("click", ":not(.assumptions-update)", function() {
            addHypothesisCardEventListener(card, variables[i]);
        })

        if(conditions.filter(e => e.name === variables[i].name).length > 0) {
            card.append(`<a class="assumptions-update">Update Assumptions</a>`); //data-toggle="modal" data-target="#assumptionModal"
            card.find(".assumptions-update").on("click", function() {
                if(analysisDV === null) {
                    alert("Please select a dependent variable in your hypothesis formation process.");
                    return;
                }
                currentAssumptionVariable = variables[i];
                let dv_name = analysisDV.name;
                let assumptions = variables[i].assumption[dv_name];
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

        // card.find(".assumptions-update").on("click", function() {
        //
        // })
        cards.push(card);
    }

    displayarea.html(cards);
}

const updateAssumptionSection = (dv, ivs) => {
    let isBetween = false, isWithin = false, isMixed = false;

    // Check if this is a mixed factorial design
    for(let i = 0; i < selectedIV.length; i++) {
        if(selectedIV[i].study_design === "between"){
            isBetween = true;
        } else {
            isWithin = true;
        }
        if(isBetween && isWithin) {
            isMixed = true;
            break;
        }
    }

    for(let i = 0; i < selectedIV.length; i++) {
        selectedIV[i].setAssumptions(dv);
    }

    // update assumption sections
    console.log(decide_method(ivs, dv));
}

const hey = (card, variable) => {
    if(variable.section === DEPENDENT_VARIABLE_ID) {
        card.css("background", "grey");

        if(analysisDVClicked) {
            analysisDVElement.css("background", "none");
            if(analysisDV.name === variable.name) {
                analysisDVClicked = false;
                analysisDVElement = null;
                analysisDV = null;
                // hypothesisPair['dv'] = null;
            } else {
                analysisDVClicked = true;
                analysisDVElement = card;
                analysisDV = variable;
                // hypothesisPair['dv'] = analysisDV;
            }
        } else {
            analysisDVClicked = true;
            analysisDVElement = card;
            analysisDV = variable;
        }
    } else {
        let selected = card.css("background-color") === "rgb(128, 128, 128)";

        if(selected) {
            card.css("background", "none");
            deleteFromArray(variable.name, selectedIV);
        } else {
            card.css("background", "grey");
            selectedIV.push(variable);
        }
    }

    updateAssumptionSection(analysisDV, selectedIV);
}

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
        if(analysisConditionClicked) {
            analysisConditionElement.css("background", "none");
            if(analysisCondition.name === variable.name) {
                analysisConditionClicked = false;
                analysisConditionElement = null;
                analysisCondition = null;
                hypothesisPair['iv'] = null;
            } else {
                analysisConditionClicked = true;
                analysisConditionElement = card;
                analysisCondition = variable;
                hypothesisPair['iv'] = analysisCondition;
            }
        } else {
            analysisConditionClicked = true;
            analysisConditionElement = card;
            analysisCondition = variable;
            hypothesisPair['iv'] = analysisCondition;
        }
        hypothesisPairListener.pair = hypothesisPair;
    }
}

const createAssumptionForms = () => {
    const independenceAssumption = $(`
            <span class="assumption-item hover-item independence-assumption">
                <p style="border: 1px black solid">Independence</p>
                <span class="hovercard">
                    <div class="tooltiptext">
                        The measures are independent of one another
                    </div>
                  </span>
            </span>`);
    const normalityAssumption = $(`
        <span class="assumption-item hover-item normality-assumption">
                <p style="border: 1px black solid">Normality</p>
                <span class="hovercard">
                    <div class="tooltiptext">
                        The distribution of the dependent variable within each group is normally distributed.
                    </div>
                </span>
        </span>
    `);

    const homoscedasticity = $(`
            <span class="assumption-item hover-item homo-assumption">
                <p style="border: 1px black solid">Equal Variances</p>
                <span class="hovercard">
                    <div class="tooltiptext">
                        The variance of each group is about the same.
                    </div>
                  </span>
            </span>`);

    const form = $(`
        <form class='assumptions'>
            <label>Assumptions</label>
            <div class="form-group" style="display: flex; flex-direction: row">
            </div>
        </form>
    `);


    form.find(".form-group").append([independenceAssumption, normalityAssumption, homoscedasticity]);
    return form;
}

// const updateHypothesisFormArea = ()
const updateHypothesisFormArea = (pair, inputArea) => {
    let dv = hypothesisPair['dv'];
    let iv = hypothesisPair['iv'];
    let hypothesisFormArea;

    // const assumptions = createAssumptionForms(iv);

    if(iv.type === 'nominal') hypothesisFormArea = createHypothesisConditionIsNominal(dv, iv);
    else hypothesisFormArea = createHypothesisConditionIsNotNominal(dv, iv);

    // Add event listener to the generate hypothesis button
    const apiBtn = $("<button type='button' class='btn btn-success submit'>Generate a Hypothesis</button>");
    apiBtn.on("click", function() {
        const conditionType = iv.type;
        let relationship;
        if(conditionType === "nominal") {
            let two_side = false;
            const selected = $(".two-side").find(":selected").val();
            if(selected === 'different') {
                two_side = true;
            } else if (selected === "same") {
                two_side = "same";
            }

            let cat1 = $(`.iv-group-custom-select-1 option:selected`).val();
            let cat2 = $('.iv-group-custom-select-2 option:selected').val();
            if(selected === 'less') {
                let temp = cat2;
                cat2 = cat1;
                cat1 = temp;
            }
            relationship = {
                'condition_type': 'nominal',
                'two-side': two_side,
                'categories': [cat1, cat2]
            }
        } else {
            let positive = false;
            let posNeg = $('.positive-negative option:selected').val();
            if(posNeg) positive = true;
            relationship = {
                'condition_type' : conditionType,
                'positive': positive
            }
        }

        // get the effect size
        effectSize = $(".effect-size-area input[type='radio']:checked").val();

        updateTeaCodeHypothesis(iv, dv, relationship);
        addJustification(iv, dv);
        setTimeout(() => {updateAnalysisTextArea(iv, dv, relationship);}, 1000)
    })
    // inputArea.append(assumptions);
    inputArea.append(hypothesisFormArea);
    inputArea.append(apiBtn);
}


const addJustification = (iv, dv) => {
    console.log(teaCode);
    decide_method().then((data) => {
        method = {
            method: API_FOREIGN_KEY[data['methods'][data['methods'].length - 1][0]],
            rationale: "rationale"
        }
        console.log(method);
    });

    // We discarded this because initial user test indicated that this is confusing
    // $(".justification").html(`
    //     <p>
    //         To test this hypothesis, you will use ${method.method}, because ${method.rationale}
    //     </p>
    // `);
}

const updateAnalysisTextArea = () => {
    let newText = "";

    for(let i = 0; i < report.hypothesis.length; i++) {
        const iv = report.hypothesis[i][0][0], dv = report.hypothesis[i][0][1];

        if(iv.type === 'nominal') {
            let compare;
            if(report.hypothesis[i][1][0] === "!=") compare = "different from";
            else if(report.hypothesis[i][1][0] === ">") compare = "greater than";
            else compare = "same as";

            newText += `H${i}: The median value of ${dv.display_name} in ${report.hypothesis[i][1][1]} group will be ${compare} that in ${report.hypothesis[i][1][2]}. `;

            newText += `We will analyze this hypothesis with ${method["method"]}. See the reproducible statistical code for analysis.`;

            // if(iv.study_design === "within") {
            //     newText += `We will analyze this hypothesis with Wilcoxon signed-rank test. See the reproducible Tea code for analysis.`
            // } else {
            //     newText += `We will analyze this hypothesis with Mann-Whitney U test. See the reproducible Tea code for analysis.`
            // }
        } else {
            const pos = report.hypothesis[i][1][0];
            if(pos === "~") {
                newText += `H${i}: The greater value of ${iv.display_name} will lead to greater value of ${dv.display_name}.`;
            } else {
                newText += `H${i}: The greater value of ${iv.display_name} will lead to less value of ${dv.display_name}.`;
            }

            newText += `We will analyze this hypothesis with a linear regression model. See the reproducible statistical code for anlaysis. `
        }
        newText += "\n";
    }

    ANALYSIS_TEXTAREA_NODE.val(newText);
}

const createHypothesisConditionIsNominal = (dv, iv) => {
    const template = $(`<form class='hypothesis_display_form'>
                    <div class="form-group">
                        <label for='name' class='col-form-label'>Hypothesis:
                        <div class="form-inline">
                            <label>The ${meanOrmedian} value of</label>
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
                            
                            ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Aperitif uses a conservative nonparametric approach when preregistering your study. If you are confident that the hypothesis testing is parametric, Aperitif will compare the mean values.")[0].outerHTML}
                        </div>
                    </div>
                    <div class="justification"></div>
                    <div class="effect-size-area">
                        <div class="form-group">
                            <label class="col-form-label">How to measure the effect size? ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "<a href='https://rpsychologist.com/cohend/' target='_blank'>What is effect size?</a>")[0].outerHTML}</label>
                            <div class="effect-size-selection">
                                <input type="radio" name="effect-size" id="cohenf" value="cohenf">
                                <label for="cohenf">Cohen's d ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Cohen's D is a conventional effect size metric to conduct power analysis.")[0].outerHTML}</label>
                            
                                <input type="radio" name="effect-size" id="sme" value="standardized">
                                <label for="sme">Standardized Mean Effects ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Standardized Mean Effects typically are used when prior analysis was conducted. ")[0].outerHTML}</label>
<!--                                <label for='cohenf'><input type="radio" id="cohenf" value="cohenf">Cohen's f</label>-->
<!--                                <label for="sme"><input type="radio" id="sme" value="standardized">Standardized Mean Effects</label>-->
                            </div>
                        </div>
                    </div>
                </form>`);

    template.on("change", function() {
        effectSize = $(".effect-size-selection input[type='radio']:checked").val();
        updateEffectSize(effectSize);
    })

    template.find(".dv-in-form").append(dv.name);
    let categoryOptions = [];
    let categoryOptions2 = [];
    for(let i = 0; i < iv.categories.length; i++) {
        const option = $(`<option value="${iv.categories[i]}">${iv.categories[i]}</option>`);
        categoryOptions.push(option);
        categoryOptions2.push(option.clone());
    }

    categoryOptions[0].prop("selected", true);
    categoryOptions2[1].prop("selected", true);

    template.find(".iv-group-custom-select-1").html(categoryOptions);
    template.find(".iv-group-custom-select-2").html(categoryOptions2);

    return template;
}

const createHypothesisConditionIsNotNominal = (dv, iv) => {
    const template = $(`
                <form class='hypothesis_display_form'>
                    <div class="form-group">
                        <label for='name' class='col-form-label'>Hypothesis:
                        <div class="form-inline" style="display: inline-block;">
                            <label>The greater value of</label>
                            <label class="iv-in-form mr-sm-2"></label>
                            <label>will lead to</label>
                            <select class="custom-select positive-negative">
                                <option value="greater" selected>greater</option>
                                <option value="less">less</option>
                                <option value="different">different</option>
                                <option value="same">the same</option>
                            </select>
                            <label class="dv-in-form"></label>
                        </div>
                    </div>
                </form>
            `);
    template.find(".dv-in-form").append(dv.name);
    template.find(".iv-in-form").append(iv.name);
    return template;
}

const addHypothesisCard = (text, id) => {
    return $(`
        <div class="hypothesis-card" id="${id}">
            <p>${text}</p>
        </div>
    `);
}


const createAnalysisTwoColumnsForm = () => {
    return $(`<div class='container'>
                <div class="row">
                    <div class="col-xs-6">
                        <p style="text-align: center">Dependent Variables</p>
                        <div class="hypothesis-dv"></div>
                    </div>
                    <div class="col-xs-6">
                        <p style="text-align: center">Independent Variables</p>
                        <div class="hypothesis-iv"></div>
                    </div>
                </div>
            </div>`);
}
