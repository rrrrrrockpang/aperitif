// Alert message on the frontend
const CONSTRUCT_ALERT = "Please input your construct and measure so that a specific measure can capture the conceptual idea of your interest.";
const CONSTRUCT_DEPENDENT_VARIABLE_ALERT = "Are you sure you don't want to specify a construct?";
const DEPENDENT_VARIABLE_NAME_ALERT = "Please input a specific variable name!";
const DEPENDENT_VARIABLE_TYPE_ALERT = "Please input a specific variable type!";
const CATEGORIES_FOR_NOMINAL_ORDINAL_ALERT= "Please use at least two categories for categorical variables!";
const INDEPENDENT_VARIABLE_NAME_ALERT = "Please input a specific variable name!";
const INDEPENDENT_VARIABLE_TYPE_ALERT = "Please select a specific variable type!";
const INDEPENDENT_VARIABLE_STUDY_DESIGN_ALERT = "Please select a specific study design type!";

let globalDVs = [];
let globalIVs = [];
let variableMap = {};
let hypothesisPair = {
    dv: null,
    iv: null
};