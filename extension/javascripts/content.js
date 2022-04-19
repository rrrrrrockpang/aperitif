
$(document).ready(function() {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    addInstruction();
    const body = $("body");
    addEffectSizeModal(body);
    addDVAperitif();
    addIVAperitif();
    addAnalysisAperitif();
    addSampleSizeAperitif();
    
    
    addAssumptionModal(body);
    addTeaModal(body);
    
    body.append(addTeaFloatingBtn());
    body.append(addMethodFloatingBtn());

    // log in with github 
    $("button[name='preview']").parent().append(`<button class="btn btn-success" id="connect"><i class="fab fa-github"></i><span id="signup-btn-text">Push Your Artifacts to Github</span></button>`);
    $("button[name='preview']").parent().append(`<button class="btn btn-success" id="login"><i class="fab fa-github"></i><span id="login-btn-text">Log in to Github</span></button>`);
    $("#connect").hide();
    $("#login").on("click", function() {
        console.log("?");
        window.open("https://aperitif-prototype.herokuapp.com/loginHere");
        $("#login").hide();
        $("#connect").show();
    })
    $("#connect").on("click", function() {
        if(confirm("You will commit the preregistration, analysis code, and methods description to a new repository upon connecting to your Github account successfully. Are you sure to proceed?")){
            (async () => {
                const response = await login("https://aperitif-prototype.herokuapp.com/github");
                
                if(response.success === 'login') {
                    alert('Please log in to Github to push your preregistration! Something might have happened in the backend. Please contact the creator.');
                } else if (response.success === "false") {
                    alert('Something happened in the backend. Please contact the creator.');
                } else {
                    OWENER = response.owner;
                    NAME = response.name;
                    commitData(OWENER, NAME);
                    alert("Success. Check you Github Repository!")
                }
                // window.open("/github", '_blank').focus();
            })();
        }
    })
});
