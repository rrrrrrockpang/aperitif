// Alert message on the frontend
const CONSTRUCT_ALERT = "Please input your construct and measure so that a specific measure can capture the conceptual idea of your interest.";
const CONSTRUCT_DEPENDENT_VARIABLE_ALERT = "Are you sure you don't want to specify a construct?";
const DEPENDENT_VARIABLE_NAME_ALERT = "Please input a specific variable name!";
const DEPENDENT_VARIABLE_TYPE_ALERT = "Please input a specific variable type!";
const CATEGORIES_FOR_NOMINAL_ORDINAL_ALERT= "Please use at least two categories for categorical variables!";
const INDEPENDENT_VARIABLE_NAME_ALERT = "Please input a specific variable name!";
const INDEPENDENT_VARIABLE_TYPE_ALERT = "Please select a specific variable type!";
const INDEPENDENT_VARIABLE_STUDY_DESIGN_ALERT = "Please select a specific study design type!";


/**
 * Global variables with Aperitif, can be updated with user input
 */
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

/**
 * Test information as well as rationale information.
 * TODO: Draft rationale to a more easy-to-understand format
 */
const INDEPENDENT_T_TEST = "independent-samples t-test",
    MANNWHITNEY_U_TEST = "Mann-Whitney U test",
    ONEWAY_ANOVA = "One-way ANOVA",
    KRUSKAL_WALLIS_TEST = "Kruskal-Wallis test",
    PAIRED_SAMPLES_T_TEST = "Paired-samples t-test",
    WILCOXON_SIGNED_RANK_TEST = "Wilcoxon signed-rank test",
    ONE_WAY_REPEATED_MEASURES_ANOVA = "One-way repeated measures ANOVA",
    FRIEDMAN_TEST = "Friedman test",
    FACTORIAL_ANOVA = "Factorial ANOVA",
    GLM = "Generalized Linear Models",
    LLM = "Linear Mixed Models",
    GLMM = "Generalized Linear Mixed Models";

const INDEPENDENT_T_TEST_RATIONALE = "https://en.wikipedia.org/wiki/Student%27s_t-test",
    MANNWHITNEY_U_TEST_RATIONALE = "https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test",
    ONEWAY_ANOVA_RATIONALE = "https://en.wikipedia.org/wiki/One-way_analysis_of_variance",
    KRUSKAL_WALLIS_TEST_RATIONALE = "https://en.wikipedia.org/wiki/Kruskal%E2%80%93Wallis_one-way_analysis_of_variance",
    PAIRED_SAMPLES_T_TEST_RATIONALE = "https://en.wikipedia.org/wiki/Student%27s_t-test#Paired_samples",
    WILCOXON_SIGNED_RANK_TEST_RATIONALE = "https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test",
    ONE_WAY_REPEATED_MEASURES_ANOVA_RATIONALE = "https://en.wikipedia.org/wiki/Repeated_measures_design#Repeated_measures_ANOVA",
    FRIEDMAN_TEST_RATIONALE = "https://en.wikipedia.org/wiki/Friedman_test",
    FACTORIAL_ANOVA_RATIONALE = "https://en.wikipedia.org/wiki/Factorial_experiment",
    GLM_RATIONALE = "https://en.wikipedia.org/wiki/Generalized_linear_model",
    LLM_RATIONALE = "https://en.wikipedia.org/wiki/Mixed_model",
    GLMM_RATIONALE = "https://en.wikipedia.org/wiki/Generalized_linear_mixed_model";


const API_FOREIGN_KEY = {
    "students_t": INDEPENDENT_T_TEST,
    "welchs_t": ONEWAY_ANOVA,
    "mannwhitney_u": MANNWHITNEY_U_TEST,
    "paired_students_t": PAIRED_SAMPLES_T_TEST,
    "wilcoxon_signed_rank": WILCOXON_SIGNED_RANK_TEST,
    "kruskall_wallis": KRUSKAL_WALLIS_TEST,
    "friedman": FRIEDMAN_TEST,
    "factorial_ANOVA": FACTORIAL_ANOVA,
    "rm_one_way_anova": ONE_WAY_REPEATED_MEASURES_ANOVA,
    "glm": GLM,
    "llm": LLM,
    "glmm": GLMM
};

const TEST_RATIONAL_FOREIGN_KEY = {};
TEST_RATIONAL_FOREIGN_KEY[INDEPENDENT_T_TEST] = INDEPENDENT_T_TEST_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[ONEWAY_ANOVA] = ONEWAY_ANOVA_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[MANNWHITNEY_U_TEST] = MANNWHITNEY_U_TEST_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[PAIRED_SAMPLES_T_TEST] = PAIRED_SAMPLES_T_TEST_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[WILCOXON_SIGNED_RANK_TEST] = WILCOXON_SIGNED_RANK_TEST_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[KRUSKAL_WALLIS_TEST] = KRUSKAL_WALLIS_TEST_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[FRIEDMAN_TEST] = FRIEDMAN_TEST_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[FACTORIAL_ANOVA] = FACTORIAL_ANOVA_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[ONE_WAY_REPEATED_MEASURES_ANOVA] = ONEWAY_ANOVA_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[GLM] = GLM_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[LLM] = LLM_RATIONALE;
TEST_RATIONAL_FOREIGN_KEY[GLMM] = GLMM_RATIONALE;

/**
 * Construct information. A construct corresponds with measure
 */
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

/**
 * Variable information. A variable can be dependent or independent. 
 * A variable has a card, as well as a display name
 */
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


/**
 * A dependent variable extends variable. It has a construct
 */
class DependentVariable extends Variable {
    constructor(name, type="", categories=[], construct=null) {
        super(name, type, categories);
        this.construct = construct;
    }

    setConstruct(construct) {
        this.construct = construct;
    }
}

/**
 * An independent variable extends variable. It has construct, assumptions. 
 * Assumptions can be adjusted by the users.
 */
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

