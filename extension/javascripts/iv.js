/**
 * A series of UI and functionality for dependent variables
 */

const INDEPENDENT_VARIABLE_ID = "iv";
const INDEPENDENT_VARIABLE_PLUGIN_ID = INDEPENDENT_VARIABLE_ID + "_aperitif";
const INDEPENDENT_VARIABLE_BTN_ID = INDEPENDENT_VARIABLE_ID + "_initial_btn";
const INDEPENDENT_VARIABLE_TEXTAREA_NODE = $("[name='text3']");
const INDEPENDENT_VARIABLE_PARENT_SECTION = INDEPENDENT_VARIABLE_TEXTAREA_NODE.parent().parent().parent();
const INDEPENDENT_VARIABLE_DESCRIPTION = "Define independent variable(s). Specify independent variable type you plan to measure. If the type is nominal, the variable has different conditions (categories). Be sure to specify \"how\" you plan to measure the each condition of the independent variable. (within-in subject or between-subject)\n";

let currentAssumptionVariable = null; // variable to update associated assumption

/** Code for variable listener */
/**
 * Listner to independent variables
 * Source: https://stackoverflow.com/questions/1759987/listening-for-variable-changes-in-javascript
 * https://jsfiddle.net/5o1wf1bn/1/
 */
 ivListener = {
    ivInternal: globalIVs,
    ivListener: function (val) {},
    set iv(val) {
        this.ivInternal = val;
        this.ivListener(val);
    },
    get iv() {
        return this.ivInternal;
    },
    registerListener: function (listener) {
        this.ivListener = listener;
    }
}

// TODO: Finish this;
ivListener.registerListener(function (ivs) {
    updateIVDisplayArea(ivs);
    updateVariableInAnalysis($(`#${ANALYSIS_PLUGIN_ID} .displayarea .hypothesis-iv`), ivs);
    updateTeaCodeVariables();
    updateMethodSection();

    if(variableMap.length === 0) {
        $("#analysis_aperitif").hide();
    } else {
        $("#analysis_aperitif").show();
    }
});


/** Code for Layout */
/**
 * Layout for independent variable. Append a series of JQuery objects to the dependent variable section
 */
const addIVAperitif= () => {
    const aperitif = createAperitifForm(INDEPENDENT_VARIABLE_PLUGIN_ID, INDEPENDENT_VARIABLE_DESCRIPTION);
    const inputArea = aperitif.find(".inputarea");
    addIVInput(inputArea);
    aperitif.append(addArrow());
    INDEPENDENT_VARIABLE_PARENT_SECTION.prepend(aperitif);
}

const addIVInput = (inputArea) => {
    const inputForm = createIVForm();
    handleIVCategoricalVariableInputForm(inputForm);
    const inputBtn = createIVBtn(inputForm);
    inputArea.append([inputForm, inputBtn]);
}


/**
 * Template to create independent variable form
 * @returns 
 */
 const createIVForm = () => {
    return $(`<form class="inputarea-form" id="${INDEPENDENT_VARIABLE_ID + "_form"}">
                    <div class="form-group">
                        <h4 for='name' class='col-form-label'>What's the exact independent variable name?</h4>
                        <input type='text' class='form-control variable-name'>
                    </div>
    
                    <div class='form-group var-type'>
                        <h4 class="radio control-label">Variable Type:</h4>
    
                        <div class="form-inline type-radio">
                            <label class='form-check-label' for='nominalRadio2'>
                                <input class='form-check-input' type='radio' id="nominalRadio2" name='variableTypeRadios' value='nominal'>
                                Nominal <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Nominal data has discrete categories. (e.g. gender or race)"></span> 
                            </label> 
                            <label class='form-check-label' for='ordinalRadio2'>
                                <input class='form-check-input' type='radio' id="ordinalRadio2" name='variableTypeRadios' value='ordinal'>
                                Ordinal <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Ordinal data has an order but no specific meaning to the values. (e.g. responses in a Likert scale, strongly disagree to strongly agree)"></span> 
                            </label>
                            <label class='form-check-label' for='intervalRadio2'>
                                <input class='form-check-input' type='radio' id="intervalRadio2" name='variableTypeRadios' value='interval'>
                                Interval <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Interval data has an order and the value is meaningful. (e.g. temperature)"></span>
                            </label>
                            <label class='form-check-label' for='ratioRadio2'>
                                <input class='form-check-input' type='radio' id="ratioRadio2" name='variableTypeRadios' value='ratio'>
                                Ratio <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Ratio data is similar to interval data but can't fall below 0. (e.g. error rate or time)"></span>
                            </label>
                        </div>
                    </div>
                </form>`);
}

/**
 * Creates a submittable button for independent variable
 * Check name, type, if a dependent variable is categorical variable and the number of categories
 * This also checks the study design if the independent variable is categorical
 * Updates the local variables (See more at variable.js)
 * @param {JQuery Object} inputForm 
 * @returns 
 */
const createIVBtn = (inputForm) => {
    const initialBtn = createInitialButton(INDEPENDENT_VARIABLE_BTN_ID, "Add Variable");
    initialBtn.on("click", function() {
        const nameInput = inputForm.find(".variable-name");
        const typeInput = inputForm.find(".var-type input[type='radio']:checked");
        const categoriesInput = inputForm.find(".add-category .categories");
        const studyDesignInput = inputForm.find(".study-design input[type='radio']:checked");

        const name = nameInput.val();
        const type = typeInput.val();
        const categories = getCurrentCategories(categoriesInput);
        const studyDesign = (studyDesignInput.length === 0) ? null : studyDesignInput.val();

        if(name.length === 0) {
            alert(INDEPENDENT_VARIABLE_NAME_ALERT);
            return
        }

        if(studyDesignInput.length === 0 && $(".study-design").is(":visible")) {
            alert(INDEPENDENT_VARIABLE_STUDY_DESIGN_ALERT);
            return
        }

        if(typeInput.length === 0) {
            alert(INDEPENDENT_VARIABLE_TYPE_ALERT);
            return
        }

        if(type === "nominal" || type === "ordinal") {
            if(categories.length < 2) {
                alert(CATEGORIES_FOR_NOMINAL_ORDINAL_ALERT);
                return
            }
        }

        updateIV(name, type, categories, studyDesign);
        updateIVTextArea();

        // Resolve to default after entering all the info
        nameInput.val("");
        typeInput.prop("checked", false);
        categoriesInput.empty();
        categoriesInput.parent().parent().hide();
        studyDesignInput.prop("checked", false);
    });
    return initialBtn;
}

/** Code for handling interaction */
const handleIVCategoricalVariableInputForm = (inputForm) => {
    study_design = $(`<div class="form-group study-design">
                        <h4 class="radio control-label">How do you plan to assign the conditions?</h4>
                        <label class='form-check-label' for='withinSubject'>
                                <input class='form-check-input' type='radio' id="withinSubject" name='studyDesignRadio' value='within'>
                                Within-Subject
                                <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip", title="The same participant tests all the conditions."></span>
                        </label>
                        <label class='form-check-label' for='betweenSubject'>
                            <input class='form-check-input' type='radio' id="betweenSubject" name='studyDesignRadio' value='between'>
                            Between-Subject
                            <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip", title="Different participant test each condition."></span>
                        </label>
                    </div>`);
    study_design.insertAfter(inputForm.find(".var-type"));
    study_design.hide();

    // Handle nominal or ordinal variables
    // Compared with dv, this section has one more type (nominal)
    const nominalArea = createCategoricalVariableInputFormArea("Categories", "nominal-category");
    const ordinalArea = createCategoricalVariableInputFormArea("Orders", "ordinal-category")
    nominalArea.insertAfter(inputForm.find(".var-type"));
    ordinalArea.insertAfter(inputForm.find(".var-type"));
    nominalArea.hide();
    ordinalArea.hide();

    inputForm.find(".var-type input[type='radio']").on("change", function() {
        const selected = inputForm.find(".var-type input[type='radio']:checked");
        let nominalArea = inputForm.find(".nominal-category");
        let ordinalArea = inputForm.find(".ordinal-category");

        if(selected.val() === "nominal") {
            if(ordinalArea.is(":visible")) ordinalArea.hide();
            nominalArea.show();
            if(study_design !== null) study_design.show();
            handleCategoryBtn(nominalArea.find(".add-category-btn")); // Manipulate Add category button
        } else if(selected.val() === "ordinal"){
            if(nominalArea.is(":visible")) nominalArea.hide();
            ordinalArea.show();
            if(study_design !== null) study_design.show();
            handleCategoryBtn(ordinalArea.find(".add-category-btn"));
        } else {
            nominalArea.hide();
            ordinalArea.hide();
            if(study_design !== null) study_design.hide();
        }
    });
}

updateIVDisplayArea = (ivs) => {
    const display = $(`#${INDEPENDENT_VARIABLE_PLUGIN_ID} .displayarea`);
    let cards = [];
    for(let i = 0; i < globalIVs.length; i++) {
        const variableObject = globalIVs[i];
        const variableCard = createIVCard(variableObject);

        variableCard.find(".delete").on("click", function() {
            deleteIV(variableCard.attr("id"));
            updateIVTextArea();
            variableCard.remove();
        });
        cards.push(variableCard);
    }
    display.html(cards);
}

const deleteIV = (card_id) => {
    delete variableMap[card_id];

    let pos = 0;
    for(let i = 0; i < globalIVs.length; i++) {
        if(card_id === globalIVs[i].card_id) {
            pos = i;
            break;
        }
    }
    globalIVs.splice(pos, 1);
    ivListener.iv = globalIVs;
}

createIVCard = (variable) => {
    let card = $(`
        <div class="uml-card" id="${variable.card_id}" style="width: 200px; height: 150px; position: relative">
            <div class="form-group mb-1" style="border-bottom: 1px solid #0f0f0f; text-align: center">
                <label class="card-header-name"></label>
            </div>
        </div>
    `);
    
    card.find(".card-header-name").append(`<p>${variable.display_name}</p>`);
    card.append(addCardDetail("Variable Type", variable.type));
    if(variable.study_design !== null) card.append(addCardDetail("Study Design", variable.study_design));
    if(variable.categories.length > 0) card.append(addCardDetail("Categories", variable.categories));

    const cancel = $(`<button type='button' class='btn-close delete close' data-dismiss='alert' aria-label='Close' style="position: absolute; top: 0; right: 0"></button>`)
    card.append(cancel)
    return card;
}

/** Code for updating variables */
/**
 * Update independent variables (or conditions)
 * adds one condition to an array of conditions
 * @param {String} name 
 * @param {String} type 
 * @param {Array} categories 
 * @param {String} construct 
 */
const updateIV = (name, type, categories, studyDesign) => {
    let conditionObject = new IndependentVariable(name, type, categories, studyDesign);
    conditionObject.card_id = INDEPENDENT_VARIABLE_ID + "_" + conditionObject.name;
    conditionObject.section = INDEPENDENT_VARIABLE_ID;

    variableMap[conditionObject.card_id] = conditionObject;
    globalIVs.push(conditionObject);
    ivListener.iv = globalIVs;
}

const updateIVTextArea = () => {
    if(globalIVs.length > 1) {
        if(!confirm("As a prototype, Apéritif can produce analysis for statistical tests that include one independent variable. You could input more to see Apéritif's layout changes, but the statistical tests might be incorrect.")) {
            return 
        }
    }
    INDEPENDENT_VARIABLE_TEXTAREA_NODE.val("");
    if(globalIVs.length > 0) {
        // Explore what kinds of study design is this
        let hasWithin = false, hasBetween = false;
        for(let i = 0; i < globalIVs.length; i++) {
            const currentIV = globalIVs[i];
            if(currentIV.study_design === "within") hasWithin = true;
            if(currentIV.study_design === "between") hasBetween = true;
        }

        let studyDesign, newText;
        if(hasWithin || hasBetween) {
            if(hasWithin && hasBetween) {
                alert("Apéritif prototype currently handles statistical tests with one independent variable. You could input more to see Apéritif's layout changes, but the statistical tests might be incorrect.")
                studyDesign = "mixed factorial design";
            } else if(hasWithin) {
                studyDesign = "within-subjects design";
            } else if(hasBetween) {
                studyDesign = "between-subjects design";
            }
            newText = `This experiment will be a ${studyDesign}. It includes the following factor(s) and level(s): \n`;
        } else {
            newText = `This experiment will be using correlation test. It includes the following independent variable(s): \n`
        }
        
        for(let i = 0; i < globalIVs.length; i++) {
            const currentIV = globalIVs[i];
            if(currentIV.type === "nominal" || currentIV.type === "ordinal") {
                newText += `${i+1}. ${capitalize(currentIV.display_name)} (`;
                for(let j = 0; j < currentIV.categories.length; j++) {
                    if(j === currentIV.categories.length - 1) {
                        newText += currentIV.categories[j] + ") "
                    } else {
                        newText += currentIV.categories[j] + ", "
                    }
                }
                newText += "Please add a little description of this variable if necessary. \n"
            } else {
                newText += `${i+1}. ${capitalize(currentIV.display_name)}. Please add a little description of this variable if necessary. \n`
            }
        }
        INDEPENDENT_VARIABLE_TEXTAREA_NODE.val(newText);
    }
}