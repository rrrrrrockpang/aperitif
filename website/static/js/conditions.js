const CONDITION_ID = "condition";
const CONDITION_PLUGIN_ID = CONDITION_ID + "_preregistea";
const CONDITION_BTN_ID = CONDITION_ID + "_initial_btn";
const CONDITION_TEXTAREA_NODE = $("[name='text3']");
const CONDITION_PARENT_SECTION = CONDITION_TEXTAREA_NODE.parent().parent().parent();
const CONDITION_DESCRIPTION =
    "Define independent variable(s). Specify independent variable type you plan to measure. If the type is nominal, the variable has different conditions (categories). Be sure to specify \"how\" you plan to measure the each condition of the independent variable. (within-in subject or between-subject)\n"

let currentAssumptionVariable = null;

ivListener = {
    ivInternal: conditions,
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

ivListener.registerListener(function (conditions) {
    updateConditionDisplayArea(conditions);
    updateVariableInAnalysis($(`#${ANALYSIS_PLUGIN_ID} .displayarea .hypothesis-iv`), conditions);
    updateTeaCodeVariables();
    updateMethodSection();

    if(variableMap.length === 0) {
        $("#analysis_preregistea").hide();
    } else {
        $("#analysis_preregistea").show();
    }
});

/////////// Layout Code ///////////

const addConditionPreregistea = () => {
    const preregistea = createPreregisteaForm(CONDITION_PLUGIN_ID, CONDITION_DESCRIPTION);
    const inputArea = preregistea.find(".inputarea");
    addConditionInput(inputArea);
    preregistea.append(addArrow());
    CONDITION_PARENT_SECTION.prepend(preregistea);
}

const addConditionInput = (inputArea) => {
    const inputForm = createConditionForm();
    handleCategoricalVariableInputForm(inputForm);
    const inputBtn = createConditionBtn(inputForm);
    inputArea.append([inputForm, inputBtn]);
}

const createConditionBtn = (inputForm) => {
    const initialBtn = createInitialButton(CONDITION_BTN_ID, "Add Variable");
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
            alert(INDEPENDENT_VARIABLE_TYPE_ALERT)
            return
        }

        if(type === "nominal" || type === "ordinal") {
            if(categories.length < 2) {
                alert(CATEGORIES_FOR_NOMINAL_ORDINAL_ALERT);
                return
            }
        }

        updateConditions(name, type, categories, studyDesign);
        updateConditionTextArea();

        nameInput.val("");
        typeInput.prop("checked", false);
        categoriesInput.empty();
        categoriesInput.parent().parent().hide();
        studyDesignInput.prop("checked", false);
    });
    return initialBtn;
}


const updateConditions = (name, type, categories, studyDesign) => {
    console.log(name, type, categories, studyDesign)
    let conditionObject = new IndependentVariable(name, type, categories, studyDesign);
    conditionObject.card_id = CONDITION_ID + "_" + conditionObject.name;
    conditionObject.section = CONDITION_ID;

    variableMap[conditionObject.card_id] = conditionObject;
    conditions.push(conditionObject);
    ivListener.iv = conditions;
}

const updateConditionTextArea = () => {
    CONDITION_TEXTAREA_NODE.val("");
    if(conditions.length > 0) {
        let within = false, between = false;
        for(let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];
            if(condition.study_design === "within") within = true;
            if(condition.study_design === "between") between = true;
        }

        let studyDesign, newText;
        if(within && between) {
            studyDesign = "mixed factorial design";
        } else if(within) {
            studyDesign = "within-subjects design";
        } else if(between) {
            studyDesign = "between-subjects design";
        }

        newText = `This experiment will be a ${studyDesign}. It comprises of the following factors and levels: \n`;

        console.log(conditions);
        for(let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];
            if(condition.type === "nominal" || condition.type === "ordinal") {
                newText += `${i+1}. ${capitalize(condition.display_name)} (`;
                for(let j = 0; j < condition.categories.length; j++) {
                    if(j === condition.categories.length - 1) {
                        newText += condition.categories[j] + ") "
                    } else {
                        newText += condition.categories[j] + ", "
                    }
                }
                newText += "Please add a little description of this variable if necessary. \n"
            } else {
                newText += `${i+1}. ${capitalize(condition.display_name)}. Please add a little description of this variable if necessary. \n`
            }
        }

        CONDITION_TEXTAREA_NODE.val(newText);
    }
}

const addAssumptionModal = (body) => {
    const modal = $(`
        <div class="modal fade" id="assumptionModal" tabindex="-1" role="dialog" aria-labelledby="assumptionModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                     <h5 class="modal-title" id="assumptionModalLabel"></h5>
                     <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                     </button>
                  </div>
                  <div class="modal-body">  
                    <div class="form-group">
                        Please check the assumptions of this statistical test. Otherwise, Coffee will use nonparametric statistical analysis.
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="assumption-independence" name="independence">
                        <label for="assumption-independence">Independence</label><br>
                        <input type="checkbox" id="assumption-normality" name="normality">
                        <label for="assumption-normality">Normality</label><br>
                        <input type="checkbox" id="assumption-equalvariance" name="equalvariance">
                        <label for="assumption-equalvariance">Equal Variance</label><br>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="save btn-success" data-dismiss="modal">Save</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  </div>
                </div>
            </div>
        </div>
    `);

    modal.on("hide.bs.modal", function(e) {
        let isIndependence = $("#assumption-independence").prop("checked");
        let isNormal = $("#assumption-normality").prop("checked");
        let isEqualVariance = $("#assumption-equalvariance").prop("checked");

        console.log(isNormal);
        console.log($("#assumption-normality"));

        for(let i = 0; i < conditions.length; i++) {
            if(currentAssumptionVariable.name === conditions[i].name) {
                conditions[i].setAssumptions(analysisDV, isNormal, isIndependence, isEqualVariance);
                break;
            }
        }


        $(this).find("input[type=checkbox]").prop("checked", "");

        currentAssumptionVariable = null;
    })

    body.append(modal);
}

const updateConditionDisplayArea = (conditions) => {
    const display = $(`#${CONDITION_PLUGIN_ID} .displayarea`);
    let cards = [];
    for(let i = 0; i < conditions.length; i++) {
        const variableObject = conditions[i];
        const variableCard = createConditionCard(variableObject);

        variableCard.find(".delete").on("click", function() {
            deleteCondition(variableCard.attr("id"));
            updateConditionTextArea();
            variableCard.remove();
        });

        // variableCard.append(`<a class="assumptions-update">Update Assumptions</a>`)
        // variableCard.find(".assumptions-update").on("click", function() {
        //
        // })
        // variableCard.popover({
        //     html: true,
        //     title: "Hi",
        //     content: function() {
        //         return $(`<p>${variableObject.type}</p>`)
        //     }
        // })
        cards.push(variableCard);
    }
    display.html(cards);
}

const deleteCondition = (card_id) => {
    delete variableMap[card_id];

    let pos = 0;
    for(let i = 0; i < conditions.length; i++) {
        if(card_id === conditions[i].card_id) {
            pos = i;
            break;
        }
    }
    conditions.splice(pos, 1);
    ivListener.iv = conditions;
}


// A bunch of forms
const createConditionForm = () => {
    return $(`<form class="inputarea-form" id="${CONDITION_ID + "_form"}">
                    <div class="form-group">
                        <h4 for='name' class='col-form-label'>What's the exact independent variable name?</h4>
                        <input type='text' class='form-control variable-name'>
                    </div>
    
                    <div class='form-group var-type'>
                        <h4 class="radio control-label">Variable Type:</h4>
    
                        <div class="form-inline type-radio">
                            <label class='form-check-label' for='nominalRadio2'>
                                <input class='form-check-input' type='radio' id="nominalRadio2" name='variableTypeRadios' value='nominal'>
                                Nominal ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Nominal data has discrete categories. (e.g. gender or race)")[0].outerHTML}
                            </label> 
                            <label class='form-check-label' for='ordinalRadio2'>
                                <input class='form-check-input' type='radio' id="ordinalRadio2" name='variableTypeRadios' value='ordinal'>
                                Ordinal ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Ordinal data has an order but no specific meaning to the values. (e.g. responses in a Likert scale, strongly disagree to strongly agree)")[0].outerHTML}
                            </label>
                            <label class='form-check-label' for='intervalRadio2'>
                                <input class='form-check-input' type='radio' id="intervalRadio2" name='variableTypeRadios' value='interval'>
                                Interval ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Interval data has an order and the value is meaningful. (e.g. temperature)")[0].outerHTML}
                            </label>
                            <label class='form-check-label' for='ratioRadio2'>
                                <input class='form-check-input' type='radio' id="ratioRadio2" name='variableTypeRadios' value='ratio'>
                                Ratio ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"></span>", "Ratio data is similar to interval data but can't fall below 0. (e.g. error rate or time)")[0].outerHTML}
                            </label>
                        </div>
                    </div>
                </form>`);
}

const createConditionCard = (variable) => {
    let card = $(`
        <div class="uml-card" id="${variable.card_id}" style="width: 200px; height: 150px; position: relative">
            <div class="form-group mb-1" style="border-bottom: 1px solid #0f0f0f; text-align: center">
                <label class="card-header-name"></label>
            </div>
        </div>
    `);

    card.find(".card-header-name").append(`<p>${variable.display_name}</p>`);
    card.append(addCardDetail("Variable Type: ", variable.type));
    if(variable.study_design !== null) card.append(addCardDetail("Study Design: ", variable.study_design));
    if(variable.categories.length > 0) card.append(addCardDetail("Categories: ", variable.categories));

    const cancel = $(`<button type='button' class='delete close' data-dismiss='alert' aria-label='Close' style="position: absolute; top: 0; right: 0">×</button>`)
    card.append(cancel)
    return card;
}