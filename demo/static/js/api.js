/**
 * Call backend API that uses Tea. 
 * See backend server code in Flask
 * Could change the API URL for your own usage
 * @returns 
 */

API_URL = "http://localhost:5000/getMethod"
API_SAMPLE_URL = 'http://127.0.0.1:5000/getSamples'

const isParametric = (dv, iv) => {
    if(dv.type === "ordinal") { 
        return false;
    } else if(dv.type === "interval" || dv.type === "ratio") { // dv can't be a nominal variable
        if(iv.assumption[dv.name].isParametric) return true;
        return false;
    } else {
        console.error("Error: Something wrong with dependent variable type.")
        return false;
    }
}

const decideMethod = (dv, iv) => {
    if(iv.isCategorical()) {
        // Correlation tests
        if(isParametric(dv, iv)) {
            if(iv.categories.length > 2) {
                if(iv.study_design === "within") {
                    return ONE_WAY_REPEATED_MEASURES_ANOVA;
                } else if (iv.study_design === "between") {
                    return ONEWAY_ANOVA;
                } else {
                    alert("Error: Methods unsupported");
                    console.log("Error: Methods unsupported");
                    return;
                }
            } else if (iv.categories.length === 2) {
                if(iv.study_design === "within") {
                    return PAIRED_SAMPLES_T_TEST;
                } else if(iv.study_design === "between") {
                    return INDEPENDENT_T_TEST; // Add Welch's t-test later
                } else {
                    alert("Error: Methods unsupported");
                    console.log("Error: Methods unsupported");
                    return;
                }
            }
        } else { // Non-parametric
            if(iv.categories.length > 2) {
                if(iv.study_design === "within") {
                    return FRIEDMAN_TEST;
                } else if(iv.study_design === "between") {
                    return KRUSKAL_WALLIS_TEST;
                } else {
                    alert("Error: Methods unsupported");
                    console.log("Error: Methods unsupported");
                    return;
                }
            } else if(iv.categories.length === 2) {
                if(iv.assumption[dv.name].normality === true && iv.study_design === "between")  {
                    return WELCH_T_TEST;
                } else if(iv.study_design === "within") {
                    return WILCOXON_SIGNED_RANK_TEST;
                } else if(iv.study_design === "between") {
                    return MANNWHITNEY_U_TEST;
                } else {
                    alert("Error: Methods unsupported");
                    console.log("Error: Methods unsupported");
                    return;
                }
            }
        }
    } else {
        // Correlation test
        if(isParametric(dv, iv)) {
            return PEARSON_R;
        } else {
            // Kendall's Tau and Spearman's rho are similar, but confidence intervals for Spearman’s rS are less reliable and less interpretable than confidence intervals for Kendall’s τ-parameters
            // We present both for non-parametric correlation test
            // Kendall, M. G. (1948). Rank correlation methods.
            // https://www.tessellationtech.io/data-science-stats-review/#:~:text=Spearman's%20is%20incredibly%20similar%20to,preferred%20method%20of%20the%20two.
            return `${KENDALL_TAU} / ${SPEARMAN_rho}`;
        }
    }
}

// Using Tea makes the response time slow for user experience
// We replicate Tea's logic for empty dataset above and could serve as a wrapper for Tea with empty dataset
// Tea didn't need to declare study type (between/within) but reason the relationship internally
// However, that is difficult for preregistration without data, as Tea will returns multiple potential answers 
// as it would for full dataset input
const decideMethodFromTea = async () => {
    const response = await fetch(API_URL, {
            method: "POST",
            mode: 'cors',
            cache: 'no-cache', 
            credentials: 'same-origin',
            body: JSON.stringify(teaCode),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
    });

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }

    let result = await response.json();
    return result;
}

const decideSamples = async (effectSize, confidence, alpha, methodName) => {
    const input = {
        "effectSize": effectSize,
        "confidence": confidence,
        "alpha": alpha,
        "method": methodName
    }
    console.log(input);
    const response = await fetch(API_SAMPLE_URL, {
        method: "POST", 
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: JSON.stringify(input),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    if(!response.ok) {
        alert("Error: Something happened in the backend."); 
        const message = `An error has occured with sampling: ${response.status}`;
        throw new Error(message);
    }

    let result = await response.json();
    return result;
}
let OWENER = "";
let NAME = "";
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
  
const commitData = (owner, name) => {
    const preregis = {
        preregistration: {
            question_1: $("[name='text1']").val(),
            question_2: $("[name='text2']").val(),
            question_3: $("[name='text3']").val(),
            question_4: $("[name='text4']").val(),
            question_5: $("[name='text5']").val(),
            question_6: $("[name='text6']").val(),
            question_7: $("[name='text7']").val(),
        }
    }

    const record = {
        preregistration: preregis["preregistration"],
        code: {
            r_code: stringifyRCode(),
            python_code: stringifyTeaCode(),
        },
        text: {
            text: stringifyMethodSection()
        }, 
        owner: owner,
        name: name
    }
    console.log(record);
    alert("?")
    sleep(5000);
    createRecord("http://127.0.0.1:5000/push", record);
}

async function createRecord(url, data) {
    const response = await fetch(url, {
        method: "PUT",
        mode: 'cors',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        body: JSON.stringify(data)
    });
    let result = await response.json();
    return result;
}

async function login(url) {
    const response = await fetch(url, {
        method: "GET", 
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin'
    });
    let result = await response.json();
    console.log(result);
    return result;
}