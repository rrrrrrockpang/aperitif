$(document).ready(function() {
    // handle variable listener
    // handleVariableListeners();
    let curr_experiment = "";
    let next_experiment = "";

    $('[data-toggle="tooltip"]').tooltip({
        delay: { "show": 0, "hide": 0 }
    });

    addInstruction();

    // add plugin sections
    addAnalysisPreregistea();
    addConstructPreregistea();
    addDependentVariablePreregistea();
    addConditionPreregistea();
    addSampleSizePreregistea();
    //
    // // Add Floating button
    const body = $("body");
    addTeaModal(body);
    addAssumptionModal(body);
    body.append(addTeaFloatingBtn());
    body.append(addMethodFloatingBtn());

    if(window.location.href.indexOf("?value=plain_experiment") > -1) {
        $(".preregistea-container").show();
        $(".leader-line").show();
        curr_experiment = "plain_experiment";
    } else {
        $(".preregistea-container").hide();
        $(".leader-line").hide();
        curr_experiment = "preregistra_experiment";
    }

    if(window.location.href.indexOf("&next=null") > -1) {
        next_experiment = null;
    }
    // $("#coffee-plugin").on("click", function() {
    //     $(".preregistea-container").show();
    //     $(".leader-line").show();
    // });
    //
    // $("#raw-aspredicted").on("click", function() {
    //     $(".preregistea-container").hide();
    //     $(".leader-line").hide();
    // })

    $("#preview").on("click", function() {
        if(confirm("Are you sure you want to finish this experiment?")) {
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
                    r_code: "r_code1",
                    python_code: "python_code1",
                    tea_code: "tea_code1"
                },
                text: {
                    text: "text_example"
                }
            }

            postData("/update_input", preregis);
            createRecord("/create", record);

            if(next_experiment != null) {
                if(curr_experiment === "plain_experiment") {
                    window.open("/display?value=preregistra_experiment&next=null");
                } else if(curr_experiment === "preregistra_experiment") {
                    window.open("/display?value=plain_experiment&next=null")
                }
            } else {
                window.open("/display?value=plain_experiment&next=finished")
            }





            // createRecord; with code and text

        }
    })
});

async function createRecord(url, data) {
    console.log(data);
    const response = await fetch(url, {
        method: "PUT",
        mode: 'cors',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        body: JSON.stringify(data)
    });
    return response.json();
}

async function postData(url, data) {
    console.log(data);
    const response = await fetch(url, {
        method: "POST",
        mode: 'cors',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        body: JSON.stringify(data)
    });

    return response.json();
}

const STEP_1_DESCRIPTION = "Step 1: Define your study in the Aperitif toolbox in each question";
const STEP_2_DESCRIPTION = "Step 2: Adjust the textarea that Aperitif auto-generated";
const STEP_3_DESCRIPTION = "Step 3: Preview analysis code, “method” section, and submit preregistration";
const STEP_4_DESCRIPTION = "Step 4: Submit Preregistration and Push your Analysis Code to Github";

const addInstruction = () => {
    const blueAlert = $(".center1 > .alert-info");

    const description = $("<div class='.row .row_create preregistea-container'></div>").css({
        display: "flex",
        "flex-direction": "row",
        "justify-content": "space-between"
    });

    const first_box = $(`<div id='first_box' class='description-box'><p>${STEP_1_DESCRIPTION}</p></div>`);
    const second_box = $(`<div id='second_box' class='description-box'>${STEP_2_DESCRIPTION}</div>`);
    const third_box = $(`<div id='third_box' class='description-box'>${STEP_3_DESCRIPTION}</div>`);
    // const fourth_box = $(`<div id='fourth_box' class='description-box'>${STEP_4_DESCRIPTION}</div>`);

    description.append([first_box, second_box, third_box]);

    description.insertAfter(blueAlert);

    new LeaderLine(
      document.getElementById('first_box'),
      document.getElementById('second_box'),
        {color: 'black', size: 3}
    );

    new LeaderLine(
      document.getElementById('second_box'),
      document.getElementById('third_box'),
                {color: 'black', size: 3}

    );
}