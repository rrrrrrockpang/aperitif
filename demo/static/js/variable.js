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

    isCategorical() {
        // There is a requirement that if a variable is categorical
        // it has to have more than 2 categories to be meaningful
        return this.categories.length >= 2; 
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

/**
 * Test information as well as rationale information.
 */
const INDEPENDENT_T_TEST = "Independent samples t-test",
    MANNWHITNEY_U_TEST = "Mann-Whitney U test",
    ONEWAY_ANOVA = "One-way ANOVA",
    KRUSKAL_WALLIS_TEST = "Kruskal-Wallis test",
    PAIRED_SAMPLES_T_TEST = "Paired-samples t-test",
    WILCOXON_SIGNED_RANK_TEST = "Wilcoxon signed-rank test",
    ONE_WAY_REPEATED_MEASURES_ANOVA = "One-way repeated measures ANOVA",
    FRIEDMAN_TEST = "Friedman test",
    WELCH_T_TEST = "Welch's t-test",
    PEARSON_R = "Pearson's r",
    KENDALL_TAU = "Kendall's tau",
    SPEARMAN_rho = "Spearman's rho";

const IsParametricDic = {
    INDEPENDENT_T_TEST: true,
    ONEWAY_ANOVA: true,
    ONE_WAY_REPEATED_MEASURES_ANOVA: true,
    PAIRED_SAMPLES_T_TEST: true,
    MANNWHITNEY_U_TEST: false,
    KRUSKAL_WALLIS_TEST: false,
    WILCOXON_SIGNED_RANK_TEST: false,
    WELCH_T_TEST: false,
    FRIEDMAN_TEST: false,
    PEARSON_R: true,
    KENDALL_TAU: false,
    SPEARMAN_rho: false
}