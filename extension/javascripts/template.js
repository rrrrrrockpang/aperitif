/**
 * This script creates template for the statistics and methods based on input variables, hypothesis, sample size
 * It also stringifies the Python, R code as well as method description
 * The method template is naive and a more comprehensive template (potentially through a focus group at CHI) should be in place in the future
 * Please see variable.js for more local variables
 */
const updateMethodSection = () => {
    report.design.dependent = globalDVs
    report.design.independent = globalIVs

    for(let i = 0; i < globalIVs.length; i++) {
        if(globalIVs[i].study_design === "within") {
            report.design.within = true;
        } else {
            report.design.between = true;
        }
    } // Code for future mixed study design
    report.design.analysis.push(methodName);

    // report.construct = constructObject.display_name;

    report.participants.number = studySampleSize;
    report.participants.alpha = 0.05;
    report.participants.effectSize = studyEffectSize;

    // report.hypothesis = teaCode["hypothesis"];
    report.exclusion = $("[name='text5']").val();
}

let reportText = "", RCode = "", pythonCode = "", teaAPICode;

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
 * Generate R code 
 * We implemented R code for 4 types of data analysis for our user evaluation
 * Credit: Jacob Wobbrock's Quantitative Research Method class and statistical analysis in R
 * http://depts.washington.edu/acelab/proj/Rstats/index.html
 * @returns 
 */
 const stringifyRCode = () => {
    if(methodName === null) {
        return "Please follow the steps in the extension! We don't have enough information to generate R Code for now."
    }

    if(methodName === MANNWHITNEY_U_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];
        return `
            library(car)
            library(coin)
            
            df = read.csv("yourfile.csv")
            df$${iv.name} = factor(df$${iv.name})
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name})
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name})
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median)
            
            # Perform Mann-Whitney U test
            wilcox_test(${dv.name} ~ ${iv.name}, data = df, distribution = "exact")
        `;
    } else if(methodName === WILCOXON_SIGNED_RANK_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            library(car)
            library(coin)
            
            df = read.csv("yourfile.csv")
            df$${iv.name} = factor(df$${iv.name})
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name})
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name})
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median)
            
            # Perform Wilcoxon Signed Rank test
            wilcoxsign_test(${dv.name} ~ ${iv.name} | Subject, data = df, distribution = "exact")
        `
    } else if(methodName === INDEPENDENT_T_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            library(car)
            
            df = read.csv("yourfile.csv")
            df$${iv.name} = factor(df$${iv.name})
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name})
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name})
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median)
            
            # Perform independent-samples t-test
            t.test(${dv.name} ~ ${iv.name}, data = df, var.equal=TRUE)
        `
    } else if(methodName === PAIRED_SAMPLES_T_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            library(car)
            
            df = read.csv("yourfile.csv")
            df$${iv.name} = factor(df$${iv.name})
            
            # Shapiro-Wilk normality test on response
            shapiro.test(df[df$${iv.name} == "${iv.categories[0]}",]$${dv.name})
            shapiro.test(df[df$${iv.name} == "${iv.categories[1]}",]$${dv.name})
            
            # Test for homogeneity of variance
            leveneTest(${dv.name} ~ ${iv.name}, center=median)
            
            # Test for order effect 
            df.wide.order = dcast(df, Subject ~ Order, value.var="${dv.name}")
            t.test(df.wide.order$"1", df.wide.order$"2", paired=TRUE, var.equal=TRUE)

            # Convert to wide format
            df.wide = dcast(df, Subject ~ ${iv.name}, value.var="${dv.name}")
            
            # Perform independent-samples t-test
            t.test(df.wide$${iv.categories[0]}, df.wide$${iv.categories[1]}, paired=TRUE, var.equal=TRUE)
        `;
    } else if(methodName === ONEWAY_ANOVA) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            # Reference: http://www.sthda.com/english/wiki/one-way-anova-test-in-r
            df = read.csv("yourfile.csv")
            df$ID = factor(df$ID) # Record ID for the subject if necessary
            df$${iv.name} = factor(df$${iv.name})
            m = aov(${dv.name} ~ ${iv.name}, data=df)
            result = anova(m)
            summary(result)
        `;
    } else if(methodName === ONE_WAY_REPEATED_MEASURES_ANOVA) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            library(ez)
            df = read.csv("yourfile.csv")
            df$ID = factor(df$ID) # Record ID for each subject
            df$${iv.name} = factor(df$${iv.name})
            m = ezANOVA(dv=${dv.name}, wid=ID, data=df)
            
            # Check sphericity violation
            # Reference: https://www.datanovia.com/en/lessons/mauchlys-test-of-sphericity-in-r/
            m$Mauchly
            m$ANOVA
        `
    } else if(methodName === KRUSKAL_WALLIS_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            # Reference: http://www.sthda.com/english/wiki/kruskal-wallis-test-in-r
            library(coin)
            df = read.csv("yourfile.csv")
            df$ID = factor(df$ID) # Record ID for each subject
            df$${iv.name} = factor(df$${iv.name})
            kruskal_test(df$${dv.name} ~ df$${iv.name}, data=df, distribution="asymptotic")
        `;
    } else if(methodName === FRIEDMAN_TEST) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            # Reference: https://www.datanovia.com/en/lessons/friedman-test-in-r/
            library(coin)
            df = read.csv("yourfile.csv")
            df$ID = factor(df$ID) # Record ID for each subject
            df$${iv.name} = factor(df$${iv.name})
            friedman_test(df$${dv.name} ~ df$${iv.name} | ID, data=df, distribution="asymptotic")
        `;
    } else if(methodName === PEARSON_R) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            # Reference: http://www.sthda.com/english/wiki/correlation-test-between-two-variables-in-r
            library("ggpubr")

            df = read.csv("youfile.csv")
            # Visualize the data
            ggscatter(df, x = ${iv.name}, y = ${dv.name}, 
                    add = "reg.line", conf.int = TRUE, 
                    cor.coef = TRUE, cor.method = "pearson")
            shapiro.test(df$${dv.name})
            shapiro.test(df$${iv.name})

            p = cor.test(df$${dv.name}, df${iv.name}, method = "pearson")
        `;
    } else if(methodName === `${KENDALL_TAU} / ${SPEARMAN_rho}`) {
        let iv = hypothesisPair['iv'];
        let dv = hypothesisPair['dv'];

        return `
            # Reference: http://www.sthda.com/english/wiki/correlation-test-between-two-variables-in-r
            library("ggpubr")

            df = read.csv("youfile.csv")
            # Visualize the data
            ggscatter(df, x = ${iv.name}, y = ${dv.name}, 
                    add = "reg.line", conf.int = TRUE, 
                    cor.coef = TRUE, cor.method = "pearson")
            shapiro.test(df$${dv.name})
            shapiro.test(df$${iv.name})

            p_kendall = cor.test(df$${dv.name}, df$${iv.name}, method = "kendall")
            p_spearman = cor.test(df$${dv.name}, df$${iv.name}, method = "spearman")
        `;
    } else {
        return `The R code for ${methodName} might not be covered by this version of the Apéritif prototype. 
        Please contact the developer!`;
    }
}

const stringifyCategories = () => {
    let temp = "";
    for(let i = 0; i < analysisIV.categories.length; i++) {
        if(i === analysisIV.categories.length - 1) {
            temp += "and " + analysisIV.categories[i];
            break;
        }
        temp += analysisIV.categories[i] + ", ";
    }
    return temp;
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

    const dv1 = globalDVs[0]
    const construct = (dv1.construct === "undefined" || dv1.construct === null) ? "<u>conceptual construct your dependent variable measures</u>" : dv1.construct;
    const analysis = (report.design.analysis === 0) ? "<u>Aperitif will determine the statistical tests for you after filling out the form</u>" : report.design.analysis;
    const dependent = (typeof report.design.dependent[0] === "undefined") ? "<u>dependent variable</u>" : report.design.dependent[0].display_name;
    let experiment_design; 
    if(methodName === PEARSON_R || methodName === `${KENDALL_TAU} / ${SPEARMAN_rho}`) {
        experiment_design = `<h3><b>Study Design</b></h3><br>To understand different ${independent} impact ${construct}, we ` +
        `designed a correlational research study. We considered the ${dependent} as the proxy variable for ${construct}. ` +
        `To measure the ${dependent}, we have users conduct <u>(you can add detailed correlational data procedure here)</u>.` +
        `<br>` +
        `Before running the experiment, we formulated and preregistered the following hypotheses.<br><br>`;
    } else {
        experiment_design = `<h3><b>Study Design</b></h3><br>To understand different ${independent} impact ${construct}, we ` +
            `designed a ${study_design} study. We considered the ${dependent} as the proxy variable for ${construct}. ` +
            `To measure the ${dependent}, we have users conduct <u>(you can add detailed experimental procedure here)</u>. Participants were assigned to one of `+
            `the ${catlength} conditions: 1) ${stringifyCategories()}.<br>` +
            `<br>` +
            `Before running the experiment, we formulated and preregistered the following hypotheses.<br><br>`;
    }
    
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
    
    experiment_design += `the ${methodName}. `;

    experiment_design += `The statistical analysis code can be reproduced by the Tea and R. <br/><br/>`

    experiment_design += `<h3><b>Participants</b></h3><br>`;

    // const effectSize = (report.participants.effectSize === null) ? "<u>effect size</u>" : report.participants.effectSize;
    // const number = (report.participants.number) ? "<u>sample size</u>" : report.participants.number;

    experiment_design += `A prospective power analysis was performed for sample size determination based on Cohen's conventional effect size ` +
        `${cohen} = ${studyEffectSize}. We achieved at least 0.8 under &#945; = 0.05 within ${studySampleSize} participants per condition.`

    return experiment_design
}
