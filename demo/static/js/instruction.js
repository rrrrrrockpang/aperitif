// Test for the green blocks 
// Serve as instruction of how to use Aperitif
const STEP_1_DESCRIPTION = "Step 1: Define your study in Apéritif";
const STEP_2_DESCRIPTION = "Step 2: Adjust the automatically-generated preregistration text";
const STEP_3_DESCRIPTION = "Step 3: Preview analysis code, “method” section, and submit preregistration";

const addInstruction = () => {
    // Set up the css format of the instruction blocks
    const blueAlert = $(".container > .alert-info");

    const description = $("<div class='.row .row_create aperitif-container'></div>").css({
        display: "flex",
        "flex-direction": "row",
        "justify-content": "space-between"
    });

    const first_box = $(`<div id='first_box' class='description-box'><p>${STEP_1_DESCRIPTION}</p></div>`);
    const second_box = $(`<div id='second_box' class='description-box'>${STEP_2_DESCRIPTION}</div>`);
    const third_box = $(`<div id='third_box' class='description-box'>${STEP_3_DESCRIPTION}</div>`);

    description.append([first_box, second_box, third_box]);

    description.insertAfter(blueAlert);

    // Using Leaderline to connect the <div>
    // Reference: https://github.com/anseki/leader-line
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
};