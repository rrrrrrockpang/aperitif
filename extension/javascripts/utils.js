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

/**
 * Delete element from array
 * @param {*} element 
 * @param {Array} array 
 * @returns 
 */
const deleteFromArray = (element, array) => {
    let pos = -1, val;
    for(let i = 0; i < array.length; i++) {
        if(element === array[i].name) {
            val = array[i];
            pos = i;
            break;
        }
    }
    if(pos === -1) {
        console.error("Couldn't find ...");
        return;
    }
    array.splice(pos, 1);
    console.log("Found element ...");
    return val;
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
 * Aesthetic arrow 
 * @returns HTML code
 */
const addArrow = () => {
    return `<div style="text-align: center">
                <span style="font-size:2em; margin: 5px; text-align: center" class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>
            </div>`;
}


/**
 * Handle interactive input form for categories of an independent variable
 * @param {JQuery Object} inputForm 
 */
const handleCategoricalVariableInputForm = (inputForm) => {
    const form_id = inputForm.attr("id");
    let study_design = null;
    if(form_id === CONDITION_ID + "_form") {
        study_design = $(`<div class="form-group study-design">
                        <h4 class="radio control-label">How do you plan to assign the conditions?</h4>
                        <label class='form-check-label' for='withinSubject'>
                                <input class='form-check-input' type='radio' id="withinSubject" name='studyDesignRadio' value='within'>
                                Within-Subject
                                ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"</span>", "The same participant tests all the conditions.")[0].outerHTML}
                            
                        </label>
                        <label class='form-check-label' for='betweenSubject'>
                            <input class='form-check-input' type='radio' id="betweenSubject" name='studyDesignRadio' value='between'>
                            Between-Subject
                            ${createCustomTooltip("<span class=\"glyphicon glyphicon-info-sign\"</span>", "Different participant test each condition.")[0].outerHTML}
                        </label>
                    </div>`);
        study_design.insertAfter(inputForm.find(".var-type"));
        study_design.hide();
    }

    const nominalArea = createCategoricalVariableInputFormArea("Categories", "nominal-category")
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
    })
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
 * Calculate a priori sample size estimation
 * Credit:
 * Adapted from: https://github.com/ZPAC-UZH/touchstone2, Source: https://touchstone2.org/
 * and https://www.stat.ubc.ca/~rollin/stats/ssize/n2.html
 */
MACHEP =  1.11022302462515654042e-16   /* 2**-53 */
UFLOWTHRESH =  2.22507385850720138309e-308 /* 2**-1022 */
MAXLOG =  7.09782712893383996732e2     /* log(MAXNUM) */
MINLOG = -7.451332191019412076235e2     /* log(2**-1075) */
MAXLOG =  7.08396418532264106224e2     /* log 2**1022 */
MINLOG = -7.08396418532264106224e2     /* log 2**-1022 */
MAXNUM =  1.79769313486231570815e308    /* 2**1024*(1-MACHEP) */
PI     =  3.14159265358979323846       /* pi */
PIO2   =  1.57079632679489661923       /* pi/2 */
PIO4   =  7.85398163397448309616e-1    /* pi/4 */
SQRT2  =  1.41421356237309504880       /* sqrt(2) */
SQRTH  =  7.07106781186547524401e-1    /* sqrt(2)/2 */
LOG2E  =  1.4426950408889634073599     /* 1/log(2) */
SQ2OPI =  7.9788456080286535587989e-1  /* sqrt( 2/pi ) */
LOGE2  =  6.93147180559945309417e-1    /* log(2) */
LOGSQ2 =  3.46573590279972654709e-1    /* log(2)/2 */
THPIO4 =  2.35619449019234492885       /* 3*pi/4 */
TWOOPI =  6.36619772367581343075535e-1 /* 2/pi */
INFINITY =  1.79769313486231570815e308    /* 2**1024*(1-MACHEP) */
NAN = 0.0
NEGZERO = 0.0
big = 4.503599627370496e15
biginv = 2.22044604925031308085e-16
MAXGAM = 171.624376956302725
LOGPI = 1.14472988584940017414
MAXSTIR = 143.01608
SQTPI = 2.50662827463100050242e0
LS2PI  =  0.91893853320467274178
MAXLGM = 2.556348e305

function MakeArray(n) {
    this.length = n
    for (var i = 1; i<= n; i++) {
     this[i] = 0
     }
    return this
}

function polevl(x, coef, N) {
    let ans = coef[0]
    let i=0
    while (++i < N+1) {
        ans = ans * x + coef[i]
    }
    return ans
}

function p1evl (x, coef, N) {
    let ans = x + coef[0];
    let i = 0
    while (++i < N) {
        ans = ans * x + coef[i]
    }
    return ans
}

function normal_cdf(a) {
    let x = a * SQRTH
    let z = Math.abs(x)

    let y;
    if (z < SQRTH) {
        y = 0.5 + 0.5*erf(x)
    } else {
        y = 0.5 * erfc(z)
        if (a > 0) {
            y = 1.0 - y
        }
    }
    return y
}


function erf(x) {
    let T = new MakeArray(5)
    T[0] = 9.60497373987051638749e0
    T[1] = 9.00260197203842689217e1
    T[2] = 2.23200534594684319226e3
    T[3] = 7.00332514112805075473e3
    T[4] = 5.55923013010394962768e4

    let U = new MakeArray(5)
    U[0] = 3.35617141647503099647e1
    U[1] = 5.21357949780152679795e2
    U[2] = 4.59432382970980127987e3
    U[3] = 2.26290000613890934246e4
    U[4] = 4.92673942608635921086e4

    if ( Math.abs(x) > 1.0) {
       return(1.0 - erfc(x))
    }
    let z = x * x
    let y = x * polevl(z, T, 4) / p1evl(z, U, 5)

    return y
}

function erfc(a) {
    let P = new MakeArray(9)
    P[0] = 2.46196981473530512524e-10
    P[1] = 5.64189564831068821977e-1
    P[2] = 7.46321056442269912687e0
    P[3] = 4.86371970985681366614e1
    P[4] = 1.96520832956077098242e2
    P[5] = 5.26445194995477358631e2
    P[6] = 9.34528527171957607540e2
    P[7] = 1.02755188689515710272e3
    P[8] = 5.57535335369399327526e2

    let Q = new MakeArray(8)
    Q[0] = 1.32281951154744992508e1
    Q[1] = 8.67072140885989742329e1
    Q[2] = 3.54937778887819891062e2
    Q[3] = 9.75708501743205489753e2
    Q[4] = 1.82390916687909736289e3
    Q[5] = 2.24633760818710981792e3
    Q[6] = 1.65666309194161350182e3
    Q[7] = 5.57535340817727675546e2

    let R = new MakeArray(6)
    R[0] = 5.64189583547755073984e-1
    R[1] = 1.27536670759978104416e0
    R[2] = 5.01905042251180477414e0
    R[3] = 6.16021097993053585195e0
    R[4] = 7.40974269950448939160e0
    R[5] = 2.97886665372100240670e0

    let S = new MakeArray(6)
    S[0] = 2.26052863220117276590e0
    S[1] = 9.39603524938001434673e0
    S[2] = 1.20489539808096656605e1
    S[3] = 1.70814450747565897222e1
    S[4] = 9.60896809063285878198e0
    S[5] = 3.36907645100081516050e0

    let x = Math.abs(a)
    if (x < 1.0) {
       return(1.0 - erf(a))
    }
    let z = -a * a

    if (z < -MAXLOG){
        if (a < 0) {
            return 2.0
        } else {
            return 0.0
        }
    }

    z = Math.exp(z)

    let p, q;
    if (x < 8.0) {
        p = polevl(x, P, 8)
        q = p1evl(x, Q, 8)
    } else {
        p = polevl(x, R, 5)
        q = p1evl(x, S, 6)
    }
    let y = (z * p)/q
    if (a < 0) {
        y = 2.0 - y
    }
    if (y === 0.0) {
        if (a < 0) {
            return 2.0
        } else {
            return 0.0
        }
    }
    return y
}



function normal_quantile(y0) {
    let P0 = new MakeArray(5)
    P0[0] = -5.99633501014107895267e1
    P0[1] = 9.80010754185999661536e1
    P0[2] = -5.66762857469070293439e1
    P0[3] = 1.39312609387279679503e1
    P0[4] = -1.23916583867381258016e0

    let Q0 = new MakeArray(8)
    Q0[0] = 1.95448858338141759834e0
    Q0[1] = 4.67627912898881538453e0
    Q0[2] = 8.63602421390890590575e1
    Q0[3] = -2.25462687854119370527e2
    Q0[4] = 2.00260212380060660359e2
    Q0[5] = -8.20372256168333339912e1
    Q0[6] = 1.59056225126211695515e1
    Q0[7] = -1.18331621121330003142e0

    let P1 = new MakeArray(9)
    P1[0] = 4.05544892305962419923e0
    P1[1] = 3.15251094599893866154e1
    P1[2] = 5.71628192246421288162e1
    P1[3] = 4.40805073893200834700e1
    P1[4] = 1.46849561928858024014e1
    P1[5] = 2.18663306850790267539e0
    P1[6] =-1.40256079171354495875e-1
    P1[7] = -3.50424626827848203418e-2
    P1[8] = -8.57456785154685413611e-4

    let Q1 = new MakeArray(8)
    Q1[0] = 1.57799883256466749731e1
    Q1[1] = 4.53907635128879210584e1
    Q1[2] = 4.13172038254672030440e1
    Q1[3] = 1.50425385692907503408e1
    Q1[4] = 2.50464946208309415979e0
    Q1[5] =-1.42182922854787788574e-1
    Q1[6] =-3.80806407691578277194e-2
    Q1[7] =-9.33259480895457427372e-4

    let P2 = new MakeArray(9)
    P2[0] = 3.23774891776946035970e0
    P2[1] = 6.91522889068984211695e0
    P2[2] = 3.93881025292474443415e0
    P2[3] = 1.33303460815807542389e0
    P2[4] = 2.01485389549179081538e-1
    P2[5] = 1.23716634817820021358e-2
    P2[6] = 3.01581553508235416007e-4
    P2[7] = 2.65806974686737550832e-6
    P2[8] = 6.23974539184983293730e-9

    let Q2 = new MakeArray(8)
    Q2[0] = 6.02427039364742014255e0
    Q2[1] = 3.67983563856160859403e0
    Q2[2] = 1.37702099489081330271e0
    Q2[3] = 2.16236993594496635890e-1
    Q2[4] = 1.34204006088543189037e-2
    Q2[5] = 3.28014464682127739104e-4
    Q2[6] = 2.89247864745380683936e-6
    Q2[7] = 6.79019408009981274425e-9

    let s2pi = 2.50662827463100050242e0


    if (y0 <= 0.0) {
        return -MAXNUM
    }

    if (y0 >= 1.0) {
        return MAXNUM
    }

    let code=1
    let y=y0
    if (y > (1.0 - 0.13533528323661269189) ) {
        y = 1.0 - y
        code = 0
    }

    if( y > 0.13533528323661269189) {
        y = y - 0.5

        let y2 = y * y
        let x = y + y * (y2 * polevl(y2, P0, 4)/p1evl(y2, Q0, 8))
        x = x * s2pi
        return x
    }

    let x = Math.sqrt(-2.0 * Math.log(y))
    let x0 = x - Math.log(x)/x

    let z = 1.0/x
    let x1;
    if( x < 8.0 ) {
        x1 = z * polevl(z, P1, 8) / p1evl(z, Q1, 8)
    } else {
        x1 = z * polevl(z, P2, 8) / p1evl(z, Q2, 8)
    }

    x = x0 - x1
    if( code !== 0 )
        x = -x

    return x
}