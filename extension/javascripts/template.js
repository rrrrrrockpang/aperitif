/**
 * This script creates template for the statistics and methods based on input variables, hypothesis, sample size
 * It also stringifies the Python, R code as well as method description
 * The method template is naive and a more comprehensive template (potentially through a focus group at CHI) should be in place in the future
 * Please see variable.js for more local variables
 */
const updateTeaCodeVariables = () => {
    let variables = [];
    let dv_study_design = [];
    let iv_study_design = [];

    updateVariableLst(dependent_variables, variables, dv_study_design);
    updateVariableLst(conditions, variables, iv_study_design);

    teaCode["variables"] = variables;
    teaCode["study_design"]["independent variables"] = iv_study_design;
    teaCode["study_design"]["dependent variables"] = dv_study_design;
}

const updateMethodSection = () => {
    report.design.dependent = dependent_variables
    report.design.independent = conditions

    for(let i = 0; i < conditions.length; i++) {
        if(conditions[i].study_design === "within") {
            report.design.within = true;
            if(!report.design.analysis.includes("Wilcoxon signed-rank test")){
                report.design.analysis.push("Wilcoxon signed-rank test");
            }
        } else {
            report.design.between = true;
            if(!report.design.analysis.includes("Mann-Whitney U-test")) {
                report.design.analysis.push("Mann-Whitney U-test");
            }
        }
    }

    // report.construct = constructObject.display_name;

    report.participants.number = studySampleSize;
    report.participants.alpha = 0.05;
    report.participants.effectSize = studyEffectSize;

    // report.hypothesis = teaCode["hypothesis"];
    report.exclusion = $("[name='text5']").val();
}

const updateTeaCodeHypothesis = (iv, dv, relationship) => {
    const report_hypothesis = [];
    const condition_type = relationship['condition_type'];
    let hypothesis = [];

    hypothesis.push([iv.name, dv.name]);
    report_hypothesis.push([iv, dv]);

    if(condition_type === "nominal" || condition_type === "ordinal") {
        const two_side = relationship['two-side'];
        const categories = relationship['categories'];
        if(categories.length !== 2) console.error("Has to compare 2 categories.");

        if(two_side === true) {
            hypothesis.push([`${iv.name}: ${categories[0]} != ${categories[1]}`]);
            report_hypothesis.push(['!=', categories[0], categories[1]])
        } else if(two_side === false) {
            hypothesis.push([`${iv.name}: ${categories[0]} > ${categories[1]}`]);
            report_hypothesis.push(['>', categories[0], categories[1]])
        } else {
            hypothesis.push([`${iv.name}: ${categories[0]} = ${categories[1]}`]);
            report_hypothesis.push(['=', categories[0], categories[1]])
        }
    } else {
        const positive = relationship['positive'];
        if(positive) {
            hypothesis.push([`${iv.name} ~ ${dv.name}`]);
            report_hypothesis.push(['~'])
        } else {
            hypothesis.push([`${iv.name} ~ -${dv.name}`]);
            report_hypothesis.push([`-~`])
        }
    }
    teaCode["hypothesis"].push(hypothesis);
    report.hypothesis.push(report_hypothesis);
}

const updateVariableLst = (dvOrIv, variableTea, studyDesignVar) => {
    for (let i = 0; i < dvOrIv.length; i++) {
        const di = dvOrIv[i];
        let variable = {
            "name": di.name,
            "data type": di.type,
        };

        if (di.type === "nominal" || di.type === "ordinal") {
            variable["categories"] = di.categories;
        }
        variableTea.push(variable);
        studyDesignVar.push(di.name);
    }
}

let reportText = "", RCode = "", pythonCode = "", teaAPICode;

const generateCodeSection = () => {
    const section = $(`
        <div class="topnav">
          <a class="tea-code">Python Code</a>
          <a class="r-code">R Code</a>
        </div>
        <br>
        <div class="code-section">
        
        </div>
    `);
    return section;
}


const stringifyTeaCode = () => {
    let finalString = "import tea \n";
    const v = teaCode["variables"];
    const vString = `variables = ${JSON.stringify(v, null, '\t')}\n`
    finalString += vString + `tea.define_variables(variables)\n\n`;

    const s = teaCode["study_design"];
    const sString = `study_design = ${JSON.stringify(s, null, '\t')} \n`
    finalString += sString + `tea.define_study_design(study_design) \n\n`

    const hs = teaCode["hypothesis"];
    let hString = "";
    for (let i = 0; i < hs.length; i++) {
        const h = hs[i];
        hString += `tea.hypothesize(${JSON.stringify(h[0])}, ${JSON.stringify(h[1])}) \n`
    }

    finalString += hString + "\n";

    return finalString
}

/**
 * Generate R code based on analysis method returned from Tea
 * Currently we only have these four types test
 * More R test code is under development for GLM, GLMM, LLM.
 * However, this implementation requires a smarter way to take independent variables
 * which is under investigation
 * @returns 
 */
 const stringifyRCode = () => {
    console.log(method);
    if(method === null) {
        return "Please follow the steps in the extension! We don't have enough information to generate R Code for now."
    }

    if(method.method === MANNWHITNEY_U_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];
        return `
            library(car)
            library(coin)
            
            df <- read.csv("yourfile.csv");
            df$${iv.name} = factor(df$${iv.name});
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name};
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name};
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median);
            
            # Perform Mann-Whitney U test
            wilcox_test(${dv.name} ~ ${iv.name}, data = df, distribution = "exact");
        `
    } else if(method.method === WILCOXON_SIGNED_RANK_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            library(car)
            library(coin)
            
            df <- read.csv("yourfile.csv");
            df$${iv.name} = factor(df$${iv.name});
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name})
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name})
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median);
            
            # Perform Wilcoxon Signed Rank test
            wilcoxsign_test(${dv.name} ~ ${iv.name} | Subject, data = df, distribution = "exact");
        `
    } else if(method.method === INDEPENDENT_T_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            library(car)
            library(coin)
            
            df <- read.csv("yourfile.csv");
            df$${iv.name} = factor(df$${iv.name});
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name})
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name})
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median);
            
            # Perform independent-samples t-test
            t.test(${dv.name} ~ ${iv.name}, data = df, var.equal=TRUE);
        `
    } else if(method === PAIRED_SAMPLES_T_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            library(car)
            library(coin)
            
            df <- read.csv("yourfile.csv");
            df$${iv.name} = factor(df$${iv.name});
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name})
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name})
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median);
            
            # Test for order effect 
            df.wide.order = dcast(df, Subject ~ Order, value.var="${dv.name}")
            t.test(df.wide.order$"1", df.wide.order$"2", paired=TRUE, var.equal=TRUE)

            # Convert to wide format
            df.wide = dcast(df, Subject ~ ${iv.name}, value.var="${dv.name}")
            
            # Perform independent-samples t-test
            t.test(df.wide$${iv.categories[0]}, df.wide$${iv.categories[1]}, paired=TRUE, var.equal=TRUE)
        `
    }
}

const stringifyMethodSection = () => {
    let study_design;
    if(report.design.within && report.design.between) study_design = "mixed factorial";
    else if(report.design.within) study_design = "within-subjects";
    else if(report.design.between) study_design = "between-subjects";

    let independent, cat1, cat2, catlength;
    if(typeof report.design.independent[0] === "undefined") {
        independent = "<u>independent variable</u>";
        cat1 = "<u>category 1</u>";
        cat2 = "<u>category 2</u>";
        catlength = "<u>Number of categories</u>"
    } else {
        independent = report.design.independent[0].display_name;
        cat1 = report.design.independent[0].categories[0];
        cat2 = report.design.independent[0].categories[1];
        catlength = report.design.independent[0].categories.length;
    }

    console.log(report)

    const dv1 = dependent_variables[0]
    console.log(dv1)

    const construct = (dv1.construct === null) ? "<u>conceptual construct your dependent variable measures</u>" : dv1.construct.display_name;
    const analysis = (report.design.analysis === 0) ? "<u>Aperitif will determine the statistical tests for you after filling out the form</u>" : report.design.analysis;
    const dependent = (typeof report.design.dependent[0] === "undefined") ? "<u>dependent variable</u>" : report.design.dependent[0].display_name;

    let experiment_design = `<h3><b>Study Design</b></h3><br>To understand different ${independent} impact ${construct}, we ` +
        `designed a ${study_design} study. We considered the ${dependent} as the proxy variable for ${construct}.` +
        `To measure the ${dependent}, we have users conduct <u>(you can add detailed experimental procedure here)</u>. Participants were assigned to one of `+
        `the ${catlength} conditions: 1) ${cat1}, and ${cat2}.<br>` +
        `<br>` +
        `Before running the experiment, we formulated and preregistered the following hypotheses.<br><br>`;

    let hypothesisText = "";

    const hypothesis_from_tea = teaCode["hypothesis"];

    if(hypothesis_from_tea.length === 0) hypothesisText += "<u>Please specify any hypothesis in Aperitif</u>"
    for(let i = 0; i < hypothesis_from_tea.length; i++) {
        const dv = hypothesis_from_tea[i][0][1];
        const iv = hypothesis_from_tea[i][0][0];
        const compare = hypothesis_from_tea[i][1][0];

        if(compare.includes("!=")) {
            let cat1 = compare.substring(compare.indexOf(": ") + 2, compare.indexOf(" !="));
            let cat2 = compare.substring(compare.indexOf("!=" + 3));
            hypothesisText += `<b>H${i+1}</b>: Participants in the ${cat1} conditions will result in different ${dv} than participants in the ${cat2} condition.<br>`;
        } else if (compare.includes(">")) {
            let cat1 = compare.substring(compare.indexOf(": ") + 2, compare.indexOf(" >"));
            let cat2 = compare.substring(compare.indexOf(">" + 3));
            hypothesisText += `<b>H${i+1}</b>: Participants in the ${cat1} conditions will result in higher mean value of ${dv} than the participants in the ${cat2} condition.<br>`;
        } else {
            let cat1 = compare.substring(compare.indexOf(": ") + 2, compare.indexOf(" ="));
            let cat2 = compare.substring(compare.indexOf("=" + 3));
            hypothesisText += `<b>H${i+1}</b>: Participants in the ${cat1} conditions will result in similar ${dv} than the participants in the ${cat2} condition.<br>`;
        }
    }

    experiment_design += hypothesisText + "<br>";

    experiment_design += `<br>We will analyze the hypothesis above with `;
    if(analysis.length > 1) {
        experiment_design += "the Wilcoxon signed-rank test and the Mann-Whitney U Test. "
    } else {
        experiment_design += `the ${method.method}. `;
    }

    experiment_design += `The statistical analysis code can be reproduced by the Tea.`

    experiment_design += `<h3><b>Participants</b></h3><br>`;

    // const effectSize = (report.participants.effectSize === null) ? "<u>effect size</u>" : report.participants.effectSize;
    // const number = (report.participants.number) ? "<u>sample size</u>" : report.participants.number;

    experiment_design += `A prospective power analysis was performed for sample size determination based on Cohen's conventional effect size ` +
        `d = ${studyEffectSize}. We achieved at least 0.8 under &#945; = 0.05 within ${studySampleSize} participants per condition.`

    return experiment_design
}
