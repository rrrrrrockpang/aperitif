/**
 * teaCode: variable to hold the necessary info in the teaCode
 */
let teaCode = {
    "variables": [],
    "study_design": {
        "study type": "experiment",
        "independent variables": [],
        "dependent variables":[]
    },
    "hypothesis": []
};

/**
 * report: variable to hold the necessary info in the methods description
 */
let report = {
    design: {
        within: false,
        between: false,
        analysis: [],
        dependent: [],
        independent: [],
        construct: ""
    },
    participants: {
        number: "",
        power_analysis: "",
        alpha: "",
        effectSize: ""
    },
    hypothesis: [],
    exclusion: ""
}


/**
 * Helper method to populate teaCode's variables and study_design sections
 * @param {*} dvOrIv 
 * @param {*} varInTea 
 * @param {*} studyDesignVarTea 
 */
const updateVariableLst = (dvOrIv, varInTea, studyDesignVarTea) => {
    for (let i = 0; i < dvOrIv.length; i++) {
        const di = dvOrIv[i];
        let variable = {
            "name": di.name,
            "data type": di.type,
        };

        if (di.type === "nominal" || di.type === "ordinal") {
            variable["categories"] = di.categories;
        }
        varInTea.push(variable);
        studyDesignVarTea.push(di.name);
    }
}

/**
 * Update the global teaCode variable directly
 */
const updateTeaCodeVariables = () => {
    let varInTea = [];
    let dvsInTea = [], ivsInTea = [];
    updateVariableLst(globalDVs, varInTea, dvsInTea);
    updateVariableLst(globalIVs, varInTea, ivsInTea);

    teaCode['variables'] = varInTea;
    teaCode['study_design']['independent variables'] = ivsInTea;
    teaCode['study_design']['dependent variables'] = dvsInTea;
}

/**
 * Update the global teaCode hypothesis directly
 */
const updateTeaCodeHypothesis = (dv, iv, relKey) => {
    const iv_type = relKey['iv_type'];
    // update the information in the methods description too
    let reportHypothesis = []; 
    let hypothesis = [];

    // Allow multiple hypothesis under the same two variables
    if(teaCode["hypothesis"].length > 0) {
        if(teaCode["study_design"]["independent variables"][0] !== iv.name || teaCode["study_design"]["dependent variables"][0] !== dv.name) {
            alert("Sorry, Apéritif prototype only support limited number of independent variables in a test. More extensive model is under development.");
            return;
        } 
    }

    hypothesis.push([iv.name, dv.name]);
    reportHypothesis.push([iv, dv]);

    // Populate the hypothesis section in the teaCode
    if(iv_type === "nominal") { // Comparison test
        if(relKey['categories'].length !== 2) console.error("Has to compare 2 categories.");
        if(relKey['two_side'] === true) {
            hypothesis.push([`${iv.name}: ${relKey['categories'][0]} != ${relKey['categories'][1]}`]);
            reportHypothesis.push(['!=', relKey['categories'][0], relKey['categories'][1]]);
        } else if(relKey['two_side'] === false) {
            hypothesis.push([`${iv.name}: ${relKey['categories'][0]} > ${relKey['categories'][1]}`]);
            reportHypothesis.push(['>', relKey['categories'][0], relKey['categories'][1]]);
        } else {
            hypothesis.push([`${iv.name}: ${relKey['categories'][0]} = ${relKey['categories'][1]}`]);
            reportHypothesis.push(['=', relKey['categories'][0], relKey['categories'][1]])
        }
    } else { // Correlation test
        if(relKey['positive']) {
            hypothesis.push([`${iv.name} ~ ${dv.name}`]);
            reportHypothesis.push(['~']);
        } else {
            hypothesis.push([`${iv.name} ~ -${dv.name}`]);
            reportHypothesis.push([`-~`]);
        }
    }
    teaCode["hypothesis"].push(hypothesis);
    report.hypothesis.push(reportHypothesis); 
}

