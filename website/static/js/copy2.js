const ANALYSIS_ID = "analysis";
const ANALYSIS_PLUGIN_ID = ANALYSIS_ID + "_preregistea";
const ANALYSIS_BTN_ID = ANALYSIS_ID + "_initial_btn";
const ANALYSIS_TEXTAREA_NODE = $("[name='text4']");
const ANALYSIS_PARENT_SECTION = ANALYSIS_TEXTAREA_NODE.parent().parent().parent();

const ANALYSIS_DESCRIPTION =
    "Specify Hypotheses between dependent and independent Variables by clicking the variables of your interest."

let effectSize = "";

let selectedIV = [];
let selectedDV = null;

selectedListener = {
    pInternal: selectedIV,
    pListener: function(val) {},
    set(val) {
        this.pInternal = val;
        this.pListener(val);
    },
    get sIV() {
        return this.pInternal;
    },
    registerListener: function(listener) {
        this.pListener = listener;
    }
}

selectedListener.registerListener(function(s) {
    const inputArea = $(`#analysis_preregistea .inputarea`);
    if(selectedDV === null || s.length === 0) {
        inputArea.append("Please choose a dependent variable and condition(s).");
    } else {
        for(let i = 0; i < s.length; i++) {
            s[i].setAssumptions(selectedDV);
        }
    }
})


const addAnalysisPreregistea = () => {
    const preregistea = createPreregisteaForm(ANALYSIS_PLUGIN_ID, ANALYSIS_DESCRIPTION);
    preregistea.append(addArrow());
    ANALYSIS_PARENT_SECTION.prepend(preregistea);

    const displayArea = preregistea.find(".displayarea");
    const container = createAnalysisTwoColumnsForm();

    displayArea.append(container);

    $(".analysis-hypothesis-btn").on("click", function() {
        updateHypothesisFormArea(selectedDV, selectedIV, preregistea.find(".inputarea"));
    })
    preregistea.hide();
}

const updateVariableInAnalysis = (displayarea, variables) => {
    let cards = [];

    for(let i = 0; i < variables.length; i++) {
        const card = addHypothesisCard(variables[i].display_name, variables[i].card_id);
        card.on("click", function() {
            addHypothesisCardEventListener(card, variables[i]);
        })
        cards.push(card);
    }

    displayarea.html(cards);
}

const updateHypothesisFormArea = (dv, ivs, inputarea) => {
    // TODO: interval data
    // sanity check
    for(let i = 0; i < ivs.length; i++) {
        if(ivs[i].type !== "nominal") {
            alert("Functions that support hypothesis declaration related to mixed variable types coming soon!");
            return;
        }
    }

    let hypothesisFormArea = createHypothesisConditionIsNominal(dv, ivs);

}

const addHypothesisCardEventListener = (card, variable) => {
    if(variable.section === DEPENDENT_VARIABLE_ID) {
        if(analysisDVClicked) {
            analysisDVElement.css("background", "none");
            if(analysisDV.name === variable.name) {
                analysisDVClicked = false;
                analysisDVElement = null;
                analysisDV = null;
                selectedDV = null;
            } else {
                card.css("background", "grey");
                analysisDVClicked = true;
                analysisDVElement = card;
                analysisDV = variable;
                selectedDV = variable;
            }
        } else {
            card.css("background", "grey");
            analysisDVClicked = true;
            analysisDVElement = card;
            analysisDV = variable;
            selectedDV = variable;
        }

        // TODO: Add iteration here;
    } else {
        let selected = card.css("background-color") === "rgb(128, 128, 128)";
        if(selected) {
            card.css("background", "none");
            deleteFromArray(variable.name, selectedIV);
        } else {
            console.log("???????")
            card.css("background", "grey");
            selectedIV.push(variable);
        }
    }

    updateAssumptionSection(analysisDV, selectedIV);
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
                <br>
                <div style="display: flex; align-items: center; justify-content: center">
                    <button type="button" class="btn btn-success analysis-hypothesis-btn" >Generate a Hypothesis</button>
                </div>
            </div>`);
}

const createHypothesisConditionIsNominal = (dv, ivs) => {
    const template = $(`<form class='hypothesis_display_form'>
                    <div class="form-group">
                        <label for='name' class='col-form-label'>Hypothesis:
                        <div class="form-inline">
                            <label>The median value of</label>
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
                        </div>
                    </div>
                    <div class="justification"></div>
                    <div class="effect-size-area">
                        <div class="form-group">
                            <label class="col-form-label">How to measure the effect size?</label>
                            <div class="effect-size-selection">
                                <input type="radio" name="effect-size" id="cohenf" value="cohenf">
                                <label for="cohenf">Cohen's f</label>
                            
                                <input type="radio" name="effect-size" id="sme" value="standardized">
                                <label for="sme">Standardized Mean Effects</label>
<!--                                <label for='cohenf'><input type="radio" id="cohenf" value="cohenf">Cohen's f</label>-->
<!--                                <label for="sme"><input type="radio" id="sme" value="standardized">Standardized Mean Effects</label>-->
                            </div>
                        </div>
                    </div>
                </form>`);
}
