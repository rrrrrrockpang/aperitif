
$(document).ready(function() {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    addInstruction();
    
    addDVAperitif();
    addIVAperitif();
    addAnalysisAperitif();
    addSampleSizeAperitif();
    
    const body = $("body");
    addAssumptionModal(body);
    addTeaModal(body);
    body.append(addTeaFloatingBtn());
    body.append(addMethodFloatingBtn());

    // log in with github 
    
    $("button#preview").parent().append(`<button class="btn btn-success" id="connect"><i class="fab fa-github"></i>Push Your Artifacts to Github</button>`);
    $("#connect").on("click", function() {
        if(confirm("You will commit the preregistration, analysis code, and methods description to a new repository upon connecting to your Github account successfully. Are you sure to proceed?")){
            (async () => {
                const response = await login("http://127.0.0.1:5000/github");
                
                console.log(response);
                OWENER = response.owner;
                NAME = response.name;
                commitData(OWENER, NAME);
            })();
            
        }
    })
});
