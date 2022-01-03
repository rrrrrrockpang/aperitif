const STEP_1_DESCRIPTION = "Step 1: Define your study in Preregistea";
const STEP_2_DESCRIPTION = "Step 2: Adjust the automatically-generated preregistration text";
const STEP_3_DESCRIPTION = "Step 3: Preview analysis code, “method” section, and submit preregistration";
const STEP_4_DESCRIPTION = "Step 4: Submit Preregistration and Push your Analysis Code to Github";

const addInstruction = () => {
    const blueAlert = $(".container > .alert-info");

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
addTeaModal($("body"));
body.append(addTeaFloatingBtn());
body.append(addMethodFloatingBtn());

$("#coffee-plugin").on("click", function() {
    $(".preregistea-container").show();
    $(".leader-line").show();
});

$("#raw-aspredicted").on("click", function() {
    $(".preregistea-container").hide();
    $(".leader-line").hide();
})

/**
 * By previewing, the user can push to github
 */
$("button[name='preview']").on("click", function() {
    if(confirm("Do you want to push this preregistration, code, and method to Github?")) {
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
            }
        }

        createRecord("http://localhost:5555/push", record);
    }
})