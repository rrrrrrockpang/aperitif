/**
 * Capitalize first letter
 * @param {string} s 
 * @returns 
 */
 const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Aesthetic arrow 
 * @returns HTML code
 */
 const addArrow = () => {
    return `<div style="text-align: center">
                <span style="font-size:2em; margin: 5px; text-align: center" class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>
            </div>`;
}

/**
 * Populate card details
 * @param {String} name 
 * @param {String} text 
 * @returns 
 */
 const addCardDetail = (name, text) => {
    return $(`
        <div class="form-group mb-0 card-details">
             <label>${name}: ${text}</label>
        </div>
    `);
}


/**
 * Create initial button for user input
 * @param {*} id 
 * @param {*} text 
 * @returns 
 */
const createInitialButton = (id, text) => {
    return $(`<button type="button" id="${id}" class="btn btn-success initial_btn">${text}</button>`)
        .css({
            right: 0,
        })
}

/**
 * Create custom tooltip since Bootstrap tooltip is difficult to integrate here
 * Source: https://www.w3schools.com/howto/howto_css_tooltip.asp
 * @param {String} text 
 * @param {String} tooltiptext 
 * @returns 
 */
 const createCustomTooltip = (text, tooltiptext) => {
    return $(`
        <span class="hover-item">
            <a style="pointer-events: none">${text}</a>
            <span class="hovercard">
                <p class="tooltiptext">
                    ${tooltiptext}
                </p>
              </span>
        </span>
    `)
}

/** Category card for nominal and ordinal variables*/
const createCategoryCard = (text) => {
    return $(`
        <span>
            <span class="category-name">${text}</span> &nbsp;
            <a class="btn btn-light delete-category">x</a>
        </span>
    `).css({
        border: "solid 1px",
        "border-color": "black",
        padding: "2px",
        "margin-left": "2px",
        "margin-right": "2px"
    })
}

/**
 * Delete the category from categories. 
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 * https://stackoverflow.com/questions/37385299/filter-and-delete-filtered-elements-in-an-array
 * @param {Array} categories 
 * @param {String} deletedCategory 
 * @returns 
 */
 const deleteCategory = (categories, deletedCategory) => {
    return categories.filter(function(value, index, arr){
        return value !== deletedCategory;
    });
}

/**
 * Find the categories in the categoryArea dom object based on user input
 * @param {Jquery object} categoryArea 
 * @returns 
 */
 const getCurrentCategories = (categoryArea) => {
    let categories = [];
    $(categoryArea).find('span .category-name').each(function() {
        if($(this).is(":visible")) categories.push($(this).text());
    })
    return categories;
}

/**
 * Handle categorical variable input form area
 */
 const createCategoricalVariableInputFormArea = (text, className) => {
    return $(`<div class="form-group add-category ${className}">
                    <div class="container w-100">
                        <div class="row">
                            <label for='name' class='col-form-label'>${text}:</label>
                            
                            <div class="form-inline">
                                <input type='text' class='form-control input-category'>
                                <button type="button" class="btn btn-success add-category-btn">Add</button>
                            </div>
                        </div>
                        <div class="row categories"></div>
                    </div>
                </div>`);
}


/**
 * Add Aperitif container that includes a input area and display area.
 * @param {*} id 
 * @param {*} description 
 * @returns 
 */
const createAperitifForm = (id, description) => {
    const aperitifContainer = $(`
            <div class="col-xs-12 aperitif-container" id="${id}" style="display: flex; flex-direction: column">
                <div class="aperitif h-100 w-100">
                    <div class='container'>
                        <div class="row h-100 playground">
                            <div class="col-sm-5 inputarea" style="position: relative; border-right: solid 2px; border-color: #4cae4c;"></div>
                            <div class="col-sm-7 displayarea" style="position: relative; min-height: 100px">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container" style="padding: 0">
                    <div class="d-flex flex-row justify-content-end p-1">
                        <a class="instruction-discription"></a>
                    </div>
                </div>
            </div>`);

    aperitifContainer.find(".instruction-discription").append(`<p data-toggle="tooltip" title="${description}">How to use this section?</p>`);
    return aperitifContainer;
}

const createAperitifForm75 = (id, description) => {
    const aperitifContainer = $(`
            <div class="col-xs-12 aperitif-container" id="${id}" style="display: flex; flex-direction: column">
                <div class="aperitif h-100 w-100">
                    <div class='container'>
                        <div class="row h-100 playground">
                            <div class="col-sm-7 displayarea" style="position: relative; border-right: solid 2px !important; border-color: #4cae4c !important;"></div>
                            <div class="col-sm-5 inputarea" style="position: relative; min-height: 100px">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container" style="padding: 0">
                    <div class="d-flex flex-row justify-content-end p-1">
                        <a class="instruction-discription"></a>
                    </div>
                </div>
            </div>`);

    aperitifContainer.find(".instruction-discription").append(`<p data-toggle="tooltip" title="${description}">How to use this section?</p>`);
    return aperitifContainer;
}

// <div class="instruction-discription" style="position: absolute; top: 0px; right: 0px !important; margin: 0px !important;"></div>