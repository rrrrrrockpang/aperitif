/**
 * A series of UI and functionality for dependent variables
 */
const DEPENDENT_VARIABLE_ID = "dv";
const DEPENDENT_VARIABLE_PLUGIN_ID = DEPENDENT_VARIABLE_ID + "_preregistea";
const DEPENDENT_VARIABLE_BTN_ID = DEPENDENT_VARIABLE_ID + "_initial_btn";
const DEPENDENT_VARIABLE_TEXTAREA_NODE = $("[name='text2']");
const DEPENDENT_VARIABLE_PARENT_SECTION = DEPENDENT_VARIABLE_TEXTAREA_NODE.parent().parent().parent();

const DEPENDENT_VARIABLE_DESCRIPTION =
    "Define dependent variable(s). Specify variable type you plan to measure. They might be a measure of the construct from the previous step."

/**
 * Listner to dependent variables
 * Source: https://stackoverflow.com/questions/1759987/listening-for-variable-changes-in-javascript
 * https://jsfiddle.net/5o1wf1bn/1/
 */
dvListener = {
    dvInternal: dependent_variables,
    dvListener: function (val) {},
    set dv(val) {
        this.dvInternal = val;
        this.dvListener(val);
    },
    get dv() {
        return this.dvInternal;
    },
    registerListener: function (listener) {
        this.dvListener = listener;
    }
}

dvListener.registerListener(function (dvs) {
    updateDependentVariableDisplayArea(dvs);
    updateVariableInAnalysis($(`#${ANALYSIS_PLUGIN_ID} .displayarea .hypothesis-dv`), dvs); // TODO: !!!
    updateTeaCodeVariables();
    updateMethodSection();

    console.log(dvs);

    if(variableMap.length === 0) {
        $("#analysis_preregistea").hide();
    } else {
        $("#analysis_preregistea").show();
    }
});

/**
 * Layout for dependent variable. Append a series of JQuery objects to the dependent variable section
 */
const addDependentVariablePreregistea = () => {
    const preregistea = createPreregisteaForm(DEPENDENT_VARIABLE_PLUGIN_ID, DEPENDENT_VARIABLE_DESCRIPTION);
    const inputArea = preregistea.find(".inputarea");
    addDependentVariableInput(inputArea);
    preregistea.append(addArrow());
    DEPENDENT_VARIABLE_PARENT_SECTION.prepend(preregistea);
}

const addDependentVariableInput = (inputArea) => {
    const inputForm = createDependentVariableForm();
    handleCategoricalVariableInputForm(inputForm);
    const inputBtn = createDependentVariableBtn(inputForm);
    inputArea.append([inputForm, inputBtn]);
}

/**
 * Creates a submittable button for dependent variable
 * Check name, type, if a dependent variable is categorical variable and the number of categories
 * Updates the local variables (See more at variable.js)
 * @param {JQuery Object} inputForm 
 * @returns 
 */
const createDependentVariableBtn = (inputForm) => {
    const initialBtn = createInitialButton(DEPENDENT_VARIABLE_BTN_ID, "Add Variable");
    initialBtn.on("click", function() {
        const nameInput = inputForm.find(".variable-name");
        const typeInput = inputForm.find(".var-type input[type='radio']:checked");
        const categoriesInput = inputForm.find(".add-category .categories");
        const constructInput = inputForm.find(".construct-name");
        const construct = constructInput.val();

        const name = nameInput.val();
        const type = typeInput.val();
        const categories = getCurrentCategories(categoriesInput);
        if(construct === null || construct.length < 1) {
            if(!confirm(CONSTRUCT_DEPENDENT_VARIABLE_ALERT)) return
        }

        if(name.length === 0) {
            alert(DEPENDENT_VARIABLE_NAME_ALERT);
            return
        }

        if(typeInput.length === 0) {
            alert(DEPENDENT_VARIABLE_TYPE_ALERT)
            return
        }

        if(type === "nominal" || type === "ordinal") {
            if(categories.length < 2) {
                alert(CATEGORIES_FOR_NOMINAL_ORDINAL_ALERT);
                return
            }
        }


        updateDependentVariables(name, type, categories, new Construct(construct));
        updateDependentVariableTextArea();

        nameInput.val("");
        typeInput.prop("checked", false);
        categoriesInput.empty();
        constructInput.val("");
        categoriesInput.parent().parent().hide();
    })
    return initialBtn;
}


/**
 * Adds a dependent variable to a list of dependent variables
 * @param {String} name 
 * @param {String} type 
 * @param {Array} categories 
 * @param {String} construct 
 */
const updateDependentVariables = (name, type, categories, construct = null) => {
    let dependentVariableObject = new DependentVariable(name, type, categories, construct);
    dependentVariableObject.setCardId(DEPENDENT_VARIABLE_ID + "_" + dependentVariableObject.name);
    dependentVariableObject.setSection(DEPENDENT_VARIABLE_ID);

    variableMap[dependentVariableObject.card_id] = dependentVariableObject;
    dependent_variables.push(dependentVariableObject);
    dvListener.dv = dependent_variables;
}


/**
 * Automatically add answer to the preregistration text area
 */
const updateDependentVariableTextArea = () => {
    DEPENDENT_VARIABLE_TEXTAREA_NODE.val("");

    if(dependent_variables.length > 0) {
        let newText = "";

        newText += `There will be ${dependent_variables.length} key dependent variables: `
        for(let i = 0; i < dependent_variables.length; i++) {
            if(i === dependent_variables.length - 1) {
                newText += `${i+1}) ${dependent_variables[i].display_name}. \n `
            } else {
                newText += `${i+1}) ${dependent_variables[i].display_name}, `
            }
        }

        for(let i = 0; i < dependent_variables.length; i++) {
            newText += `${i+1}. ${capitalize(dependent_variables[i].display_name)}. `;
            if(dependent_variables[i].construct !== null) {
                newText += `${capitalize(dependent_variables[i].display_name)} is used to measure ${dependent_variables[i].construct.display_name}. `
            }
            newText += "Please add a little description of this variable if necessary. \n";
        }

        DEPENDENT_VARIABLE_TEXTAREA_NODE.val(newText);
    }

}

/**
 * Update dependent variable display area including/deleting a card
 * @param {*} dvs 
 */
const updateDependentVariableDisplayArea = (dvs) => {
    const display = $(`#${DEPENDENT_VARIABLE_PLUGIN_ID} .displayarea`);
    let cards = [];
    for(let i = 0; i < dvs.length; i++) {
        const variableObject = dvs[i];
        const variableCard = createVariableCard(variableObject);
        variableCard.find(".delete").on("click", function () {
            deleteVariable(variableCard.attr("id"));
            updateDependentVariableTextArea();
            variableCard.remove();
        })
        cards.push(variableCard);
    }
    display.html(cards);
}

const deleteVariable = (card_id) => {
    delete variableMap[card_id];

    let pos = 0;
    for(let i = 0; i < dependent_variables.length; i++) {
        if(card_id === dependent_variables[i].card_id) {
            pos = i;
            break;
        }
    }

    dependent_variables.splice(pos, 1);
    dvListener.dv = dependent_variables;
}

/**
 * Template to create dependent variable form
 * @returns 
 */
const createDependentVariableForm = () => {
    return $(`<form class="inputarea-form">
<!--                    <div>-->
<!--                        <div class="form-group construct-group" style="display: none"> -->
<!--                              <h4 class="radio control-label construct-label" >Construct:-->
<!--                               <span class='glyphicon glyphicon-info-sign' data-toggle="tooltip" data-placement="right" title="A dependent variable does not necessarily need to have a construct from above."></span>-->
<!--                              </h4>-->
<!--                              <div class="construct-card" style="display: flex;"></div>-->
<!--                        </div>-->
<!--                    </div>-->
                    <div class="form-group">
                        <h4 for='variable-name' class='col-form-label'>What's the exact dependent variable name?</h4>
                        <input type='text' class='form-control variable-name' required>
                    </div>
                    
                    <div class="form-group">
                        <h4 for='variable-name' class='col-form-label'>What construct does this variable measure? ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "You can select the construct in the question above and right click it.")[0].outerHTML}</h4>
                            
                        <input type='text' class='form-control construct-name' required>
                    </div>
    
                    <div class='form-group var-type'>
                        <h4 class="radio control-label">Variable Type:</h4>
    
                        <div class="form-inline type-radio">
                            <label class='form-check-label' for='nominalRadio'>
                                <input class='form-check-input' type='radio' id="nominalRadio" name='variableTypeRadios' value='nominal'>
                                Nominal ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Nominal data has discrete categories. (e.g. gender or race)")[0].outerHTML}
                            </label> 
                            <label class='form-check-label' for='ordinalRadio'>
                                <input class='form-check-input' type='radio' id="ordinalRadio" name='variableTypeRadios' value='ordinal'>
                                Ordinal ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Ordinal data has an order but no specific meaning to the values. (e.g. responses in a Likert scale, strongly disagree to strongly agree)")[0].outerHTML}
                            </label>
                            
                            <label class='form-check-label' for='intervalRadio'>
                                <input class='form-check-input' type='radio' id="intervalRadio" name='variableTypeRadios' value='interval'>
                                Interval ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Interval data has an order and the value is meaningful. (e.g. temperature)")[0].outerHTML}
                            </label>
                            <label class='form-check-label' for='ratioRadio'>
                                <input class='form-check-input' type='radio' id="ratioRadio" name='variableTypeRadios' value='ratio'>
                                Ratio ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Ratio data is similar to interval data but can't fall below 0. (e.g. error rate or time)")[0].outerHTML}
                            </label>
                        </div>
                       
                    </div>
                </form>`);
}

const createVariableCard = (variable) => {
    let card = $(`
        <div class="uml-card" id="${variable.card_id}" style="width: 200px; height: 150px; position: relative">
            <div class="form-group mb-1" style="border-bottom: 1px solid #0f0f0f; text-align: center">
                <label class="card-header-name"></label>
            </div>
        </div>
    `);

    card.find(".card-header-name").append(`<p>${variable.display_name}</p>`);
    card.append(addCardDetail("Variable Type", variable.type));
    if(variable.categories.length > 0) card.append(addCardDetail("Categories", variable.categories));
    if(variable.construct != null) card.append(addCardDetail("Construct", variable.construct.display_name));

    const cancel = $(`<button type='button' class='delete close' data-dismiss='alert' aria-label='Close' style="position: absolute; top: 0; right: 0">×</button>`)
    card.append(cancel)
    return card;
}