/**
 * This is the script to configure the modal function and default positions for buttons 
 * that opens "Statistical Analysis" and "Method Section".
 * @returns 
 */
const addTeaFloatingBtn = () => {
    return btn = $(`
        <button id="tea-floating-btn" class="aperitif-container floating-btn" data-bs-toggle="modal" data-bs-target="#exampleModal">Statistical Analysis</button>
    `);
}
  

const addMethodFloatingBtn = () => {
    return btn = $(`
        <button id="method-floating-btn" class="aperitif-container floating-btn" data-bs-toggle="modal" data-bs-target="#exampleModal">Method Section</button>
    `);
}

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

const addTeaModal = (body) => {
    const modal = $(`
        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel"></h5>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
            </div>
        </div>
    `);

    codeSection = generateCodeSection();

    modal.on("show.bs.modal", function(event) {
        const button = $(event.relatedTarget);
        const btn_id = button.attr("id");

        const modal = $(this);
        if (btn_id === "tea-floating-btn") {
            modal.find('.modal-title').html("Statistical Analysis Code");
            modal.find('.modal-body').html(codeSection).css("word-wrap", "break-word");

            modal.find(".tea-code").on("click", function() {
                $(".code-section").html(`<code>${stringifyTeaCode()}</code>`).css( "white-space", "pre");;
            })

            modal.find(".r-code").on("click", function() {
                $(".code-section").html(`<code>${stringifyRCode()}</code>`).css( "white-space", "pre-line");
            })

        } else if(btn_id === "method-floating-btn") {
            modal.find('.modal-title').html("Method Section: You can edit here.");
            modal.find('.modal-body').html(`<div class="editable" contenteditable="true">${reportText.length <= 0 ? stringifyMethodSection() : reportText}</div>`).css("white-space", "normal");
            $('.save').on("click", function() {
                reportText = $(".editable").html();
            })
        }
    })

    body.append(modal);
}