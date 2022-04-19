/**
 * A series of UI and functionality for dependent variables
 */
 const DEPENDENT_VARIABLE_ID = "dv";
 const DEPENDENT_VARIABLE_PLUGIN_ID = DEPENDENT_VARIABLE_ID + "_aperitif";
 const DEPENDENT_VARIABLE_BTN_ID = DEPENDENT_VARIABLE_ID + "_initial_btn";
 const DEPENDENT_VARIABLE_TEXTAREA_NODE = $("[name='text2']");
 const DEPENDENT_VARIABLE_PARENT_SECTION = DEPENDENT_VARIABLE_TEXTAREA_NODE.parent().parent().parent();
 
 const DEPENDENT_VARIABLE_DESCRIPTION =
     "Define dependent variable(s). Specify variable type you plan to measure. They might be a measure of the construct from the previous step.";

/**
 * Listner to dependent variable change
 * Source: https://stackoverflow.com/questions/1759987/listening-for-variable-changes-in-javascript
 * https://jsfiddle.net/5o1wf1bn/1/
 */
 dvListener = {
    dvInternal: globalDVs,
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

// TODO: Finish this;
dvListener.registerListener(function (dvs) {
    updateDVDisplayArea(dvs);
    updateVariableInAnalysis($(`#${ANALYSIS_PLUGIN_ID} .displayarea .hypothesis-dv`), dvs); 
    updateTeaCodeVariables();
    updateMethodSection();

    if(variableMap.length === 0) {
        $("#analysis_aperitif").hide();
    } else {
        $("#analysis_aperitif").show();
    }
});

/**
 * Layout for dependent variable. Append a series of JQuery objects to the dependent variable section
 */
const addDVAperitif = () => {
    const aperitif = createAperitifForm(DEPENDENT_VARIABLE_PLUGIN_ID, DEPENDENT_VARIABLE_DESCRIPTION);
    const inputArea = aperitif.find(".inputarea");
    addDVInput(inputArea);
    aperitif.append(addArrow());
    DEPENDENT_VARIABLE_PARENT_SECTION.prepend(aperitif);
}

const addDVInput = (inputArea) => {
    const inputForm = createDVForm();
    handleDVCategoricalVariableInputForm(inputForm);
    const inputBtn = createDVBtn(inputForm);
    inputArea.append([inputForm, inputBtn]);
}

const createDVBtn = (inputForm) => {
    const initialBtn = createInitialButton(DEPENDENT_VARIABLE_BTN_ID, "Add Variable");
    // Add variable logic here
    initialBtn.on("click", function() {
        // obtain the user input variable info
        const nameInput = inputForm.find(".variable-name");
        const typeInput = inputForm.find(".var-type input[type='radio']:checked");
        const categoriesInput = inputForm.find(".add-category .categories");
        const constructInput = inputForm.find(".construct-name");
        const name = nameInput.val();
        const construct = constructInput.val();
        const type = typeInput.val();
        const categories = getCurrentCategories(categoriesInput);

        // Have the user make sure they want to skip construct
        if(construct === null || construct.length < 1) {
            if(!confirm(CONSTRUCT_DEPENDENT_VARIABLE_ALERT)) return
        }
        // Make sure users don't skip name, type
        if(name.length === 0) {
            alert(DEPENDENT_VARIABLE_NAME_ALERT);
            return
        }

        if(typeInput.length === 0) {
            alert(DEPENDENT_VARIABLE_TYPE_ALERT)
            return
        }
        // Make sure users input enough categories
        if(type === "ordinal" && categories.length < 2) {
            alert(CATEGORIES_FOR_NOMINAL_ORDINAL_ALERT);
            return
        }

        updateDV(name, type, categories, construct);
        updateDVTextArea();

        // Resolve to default after entering all the info
        nameInput.val("");
        typeInput.prop("checked", false);
        categoriesInput.empty();
        constructInput.val("");
        categoriesInput.parent().parent().hide();
    });
    return initialBtn;
}



/**
 * Adds a dependent variable to a list of dependent variables
 * @param {String} name 
 * @param {String} type 
 * @param {Array} categories 
 * @param {String} construct 
 */
 const updateDV = (name, type, categories, construct = null) => {
    let dependentVariableObject = new DependentVariable(name, type, categories, construct);
    dependentVariableObject.setCardId(DEPENDENT_VARIABLE_ID + "_" + dependentVariableObject.name);
    dependentVariableObject.setSection(DEPENDENT_VARIABLE_ID);

    variableMap[dependentVariableObject.card_id] = dependentVariableObject;
    globalDVs.push(dependentVariableObject);
    dvListener.dv = globalDVs;
}

/**
 * Automatically add answer to the preregistration text area
 */
 const updateDVTextArea = () => {
    DEPENDENT_VARIABLE_TEXTAREA_NODE.val("");

    if(globalDVs.length > 0) {
        let newText = "";

        newText += `There will be ${globalDVs.length} key dependent variables: `
        // proper display of information
        for(let i = 0; i < globalDVs.length; i++) {
            if(i === globalDVs.length - 1) {
                newText += `${i+1}) ${globalDVs[i].display_name}. \n `
            } else {
                newText += `${i+1}) ${globalDVs[i].display_name}, `
            }
        }

        for(let i = 0; i < globalDVs.length; i++) {
            newText += `${i+1}. ${capitalize(globalDVs[i].display_name)}. `;
            if(globalDVs[i].construct !== null) {
                newText += `${capitalize(globalDVs[i].display_name)} is a ${globalDVs[i].type} variable used to measure ${globalDVs[i].construct}. `
            }
            newText += "Please add a little description of this variable if necessary. \n";
        }

        DEPENDENT_VARIABLE_TEXTAREA_NODE.val(newText);
    }
}

/**
 * Template to create dependent variable form
 * It includes questions: What's the exact dependent variable name?
 * What construct does this variable measure?
 * Variable Type
 * @returns 
 */
 const createDVForm = () => {
    return $(`<form class="inputarea-form">
                    <div class="form-group">
                        <h4 for='variable-name' class='col-form-label'>What's the exact dependent variable name?</h4>
                        <input type='text' class='form-control variable-name' required>
                    </div>
                    
                    <div class="form-group">
                        <h4 for='variable-name' class='col-form-label'>What construct does this variable measure? <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="You can select the construct in the question above and right click it."></span>
                            
                        <input type='text' class='form-control construct-name' required>
                    </div>
    
                    <div class='form-group var-type'>
                        <h4 class="radio control-label">Variable Type:</h4>
    
                        <div class="form-inline type-radio">
                            <label class='form-check-label' for='nominalRadio'>
                                <input class='form-check-input' type='radio' id="nominalRadio" value='nominal' disabled>
                                Nominal <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Selecting nominal here would be a classification task, which is not currently supported by Apéritif."></span>
                            </label>
                            <label class='form-check-label' for='ordinalRadio'>
                                <input class='form-check-input' type='radio' id="ordinalRadio" name='variableTypeRadios' value='ordinal'>
                                Ordinal <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Ordinal data has an order but no specific meaning to the values. (e.g. responses in a Likert scale, strongly disagree to strongly agree)"></span>
                            </label>
                            
                            <label class='form-check-label' for='intervalRadio'>
                                <input class='form-check-input' type='radio' id="intervalRadio" name='variableTypeRadios' value='interval'>
                                Interval <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Interval data has an order and the value is meaningful. (e.g. temperature)"></span>
                            </label>
                            <label class='form-check-label' for='ratioRadio'>
                                <input class='form-check-input' type='radio' id="ratioRadio" name='variableTypeRadios' value='ratio'>
                                Ratio <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" title="Ratio data is similar to interval data but can't fall below 0. (e.g. error rate or time)"></span>
                            </label>
                        </div>
                    </div>
                </form>`);
}

/**
 * Variable card layout
 * @param {*} variable 
 * @returns 
 */
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
    if(variable.construct !== null || variable.construct !== "undefined") card.append(addCardDetail("Construct", variable.construct));

    const cancel = $(`<button type='button' class='btn-close delete close' data-dismiss='alert' aria-label='Close' style="position: absolute; top: 0; right: 0"></button>`)
    card.append(cancel)
    return card;
}

/**
 * handle the interactive button to add category
 * @param {*} categoryAreaBtn 
 */
 const handleCategoryBtn = (categoryAreaBtn) => {
    // categoryArea is the nominal or ordinal area
    const categoryArea = categoryAreaBtn.closest(".add-category");
    categoryAreaBtn.on('click', function() {
        let categories = getCurrentCategories(categoryArea);
        const newCategory = categoryArea.find(".input-category:visible").val();
        if(newCategory.length === 0) return;
        categories.push(newCategory);

        const card = createCategoryCard(newCategory);
        card.find(".delete-category").on("click", function() {
            const cardComponent = $(this).parent();
            const deletedCategory = cardComponent.find('.category-name:visible').text();
            categories = deleteCategory(categories, deletedCategory);
            cardComponent.remove();
        });
        categoryArea.find(".input-category:visible").val('');
        categoryArea.find(".categories:visible").append(card);
    })
}

/**
 * Handle interactive input form for categories of an independent variable
 * @param {JQuery Object} inputForm 
 */
 const handleDVCategoricalVariableInputForm = (inputForm) => {
    // We decide supporting nominal response variable, which is essentially a classification task as future work
    const ordinalArea = createCategoricalVariableInputFormArea("Orders", "ordinal-category") // use helper function in utils
    ordinalArea.insertAfter(inputForm.find(".var-type"));
    ordinalArea.hide();

    inputForm.find(".var-type input[type='radio']").on("change", function() {
        const selected = inputForm.find(".var-type input[type='radio']:checked");
        let ordinalArea = inputForm.find(".ordinal-category");
        if(selected.val() === "ordinal"){
            ordinalArea.show();
            handleCategoryBtn(ordinalArea.find(".add-category-btn"));
        } else {
            ordinalArea.hide();
        }
    })
}

// Dependent variables display areas //

/**
 * Update dependent variable display area including/deleting a card
 * @param {*} dvs 
 */
 const updateDVDisplayArea = (dvs) => {
    const display = $(`#${DEPENDENT_VARIABLE_PLUGIN_ID} .displayarea`);
    let cards = [];
    for(let i = 0; i < dvs.length; i++) {
        const variableObject = dvs[i];
        const variableCard = createVariableCard(variableObject);
        variableCard.find(".delete").on("click", function () {
            deleteVariable(variableCard.attr("id"));
            updateDVTextArea();
            variableCard.remove();
        })
        cards.push(variableCard);
    }
    display.html(cards);
}

const deleteVariable = (card_id) => {
    delete variableMap[card_id];

    let pos = 0;
    for(let i = 0; i < globalDVs.length; i++) {
        if(card_id === globalDVs[i].card_id) {
            pos = i;
            break;
        }
    }

    globalDVs.splice(pos, 1);
    dvListener.dv = globalDVs;
}