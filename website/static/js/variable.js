let dependent_variables = [];
let conditions = [];
let suggested = [];
let variableMap = {};
let hypothesisPair = {
    dv: null,
    iv: null
};

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


let constructs = [];
let constructMap = {};
let constructMeasureMap = {};


let teaCode = {
    "variables": [],
    "study_design": {
        "study type": "experiment",
        "independent variables": [],
        "dependent variables":[]
    },
    "hypothesis": []
};

analysisConditionClicked = false;
analysisCondition = null;
analysisConditionElement = null;

analysisDVClicked = false;
analysisDV = null;
analysisDVElement = null;

constructClicked = false;
constructObject = null;
constructElement = null;

// class Construct {
//     constructor(untrimmed_construct, untrimmed_measure) {
//         // construct = construct.trim();
//         // measure = measure.trim();
//         console.log(untrimmed_construct + "saffda");
//         let construct = untrimmed_construct.trim();
//         let measure = untrimmed_measure.trim();
//
//
//
//         this.construct = construct.split(' ').join('_');
//         this.measure = measure.split(' ').join('_');
//
//         this.display_name = construct;
//         this.display_measure = measure;
//         this.isEditing = false;
//         this.selected = false;
//         this.card_id = null;
//     }
//
//     set(construct, measure) {
//         this.construct = construct;
//         this.measure = measure;
//     }
//
//     isEditing() {
//         this.isEditing = true;
//     }
//
//     addMeasure(measure) {
//         this.measure = measure;
//     }
// }

class Construct {
    constructor(name) {
        this.name = name.split(' ').join('_');
        this.display_name = name;
        this.measures = [];
    }

    addMeasure(variable) {
        this.measures.push(variable);
    }
}

class Variable {
    constructor(name, type="", categories=[]) {
        this.name = name.replace(/[^A-Z0-9]+/ig, "_");
        this.type = type;
        this.categories = categories;
        this.display_name = name;
    }

    setSection(section) {
        this.section = section;
    }

    setCardId(card_id) {
        this.card_id = card_id;
    }

    getDisplayName() {
        return this.display_name;
    }
}

class DependentVariable extends Variable {
    constructor(name, type="", categories=[], construct=null) {
        super(name, type, categories);
        this.construct = construct;
    }

    setConstruct(construct) {
        this.construct = construct;
    }
}

class IndependentVariable extends Variable {
    constructor(name, type="", categories=[], study_design=null) {
        super(name, type, categories);
        this.study_design = study_design;
        this.assumption = {};
    }

    setAssumptions(dependent, isNormal=false, isIndependent=false, isEqualVariance=false) {
        this.assumption[dependent.name] = {
            normality: isNormal,
            independence: isIndependent,
            homoscedasticity: isEqualVariance,
            dependent: dependent,
            isParametric: isNormal && isIndependent && isEqualVariance && (dependent.type === "ratio" || dependent.type === "interval")
        }

         // Need to change this
    }

    setNormal(dependent, isNormal) {
        this.assumption[dependent].normality = isNormal;
    }

    setIndependent(dependent, isIndependent) {
        this.assumption[dependent].independence = isIndependent;
    }

    setEqualVariance(dependent, isEqualVariance) {
        this.assumption[dependent].homoscedasticity = isEqualVariance;
    }



    setStudyDesign(study_design) {
        this.study_design = study_design;
    }
}

// class Variable {
//     constructor(name, type='', categories=[]) {
//         this.name = name.split(' ').join('_');
//         this.type = type;
//         this.categories = categories;
//
//         this.display_name = name;
//         this.isEditing = false;
//         this.study_design = "";
//         this.construct = null;
//     }
//
//     set(name, type, categories=[]) {
//         this.name = name;
//         this.type = type;
//         this.categories = categories;
//     }
//
//     isEditing() {
//         this.isEditing = true;
//     }
//
//     addConstruct(construct) {
//         this.construct = construct;
//     }
// }


const CONSTRUCT_ALERT = "Please input your construct and measure so that a specific measure can capture the conceptual idea of your interest.";

const CONSTRUCT_DEPENDENT_VARIABLE_ALERT = "Are you sure you don't want to specify a construct?";

const DEPENDENT_VARIABLE_NAME_ALERT = "Please input a specific variable name!";

const DEPENDENT_VARIABLE_TYPE_ALERT = "Please input a specific variable type!";

const CATEGORIES_FOR_NOMINAL_ORDINAL_ALERT= "Please use at least two categories for categorical variables!";

const INDEPENDENT_VARIABLE_NAME_ALERT = "Please input a specific variable name!";

const INDEPENDENT_VARIABLE_TYPE_ALERT = "Please select a specific variable type!";

const INDEPENDENT_VARIABLE_STUDY_DESIGN_ALERT = "Please select a specific study design type!";

