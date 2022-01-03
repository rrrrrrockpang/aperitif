// cListener = {
//     cInternal: constructs,
//     cListener: function(val) {},
//     set c(val) {
//         this.cInternal = val;
//         this.cListener(val);
//     },
//     get c() {
//         return this.cInternal;
//     },
//     registerListener: function(listener) {
//         this.cListener = listener
//     }
// }
//
// dvListener = {
//     dvInternal: dependent_variables,
//     dvListener: function (val) {},
//     set dv(val) {
//         this.dvInternal = val;
//         this.dvListener(val);
//     },
//     get dv() {
//         return this.dvInternal;
//     },
//     registerListener: function (listener) {
//         this.dvListener = listener;
//     }
// }
//
// ivListener = {
//     ivInternal: conditions,
//     ivListener: function (val) {},
//     set iv(val) {
//         this.ivInternal = val;
//         this.ivListener(val);
//     },
//     get iv() {
//         return this.ivInternal;
//     },
//     registerListener: function (listener) {
//         this.ivListener = listener;
//     }
// }
//
// hypothesisPairListener = {
//     pInternal: hypothesisPair,
//     pListener: function (val) {},
//     set pair(val) {
//         this.pInternal = val;
//         this.pListener(val);
//     },
//     get pair() {
//         return this.pInternal;
//     },
//     registerListener: function (listener) {
//         this.pListener = listener;
//     }
// }
//
// cListener.registerListener(function(constructs) {
//     // let sections = {};
//     // sections[HYPOTHESIS_ID] = $(`#${HYPOTHESIS_ID}_preregistea .displayarea`);
//     // populateCards(HYPOTHESIS_ID, sections, constructs);
//     //
//     // let options = [];
//     // for(let i = 0; i < constructs.length; i++) {
//     //     const c = constructs[i];
//     //     if (!c.selected) {
//     //         const optionCard = $(`<div class="construct-card" style="border: solid"><span>${c.construct}</span></div>`);
//     //         optionCard.on("click", function () {
//     //             $(this).css("background", "grey");
//     //
//     //             if (constructClicked) {
//     //                 constructElement.css("background", "none");
//     //                 if (constructObject.construct === c.construct) {
//     //                     constructClicked = false;
//     //                     constructElement = null;
//     //                     constructObject = null;
//     //                 } else {
//     //                     constructClicked = true;
//     //                     constructElement = $(this);
//     //                     constructObject = c;
//     //                 }
//     //             } else {
//     //                 constructClicked = true;
//     //                 constructElement = $(this);
//     //                 constructObject = c;
//     //             }
//     //         });
//     //         options.push(optionCard);
//     //     }
//     // }
//     //
//     // $(".construct-card").html(options);
//     //
//     // if(constructs.length <= 0) $(".construct-group").hide();
//     // else $(".construct-group").show();
//     //TODO: updateTeaCodeVariables();
// })
//
// dvListener.registerListener(function (dvs) {
//     $(".hypothesis-dv").empty();
//     $(`#${DV_ID}_preregistea .displayarea`).empty();
//
//     let sections = {};
//     sections[DV_ID] = $(`#${DV_ID}_preregistea .displayarea`);
//     sections[ANALYSIS_ID] = $(`#${ANALYSIS_ID}_preregistea .displayarea .hypothesis-dv`)
//     populateCards(DV_ID, sections, dvs); // In relevant sections
//     updateTeaCodeVariables();
// });
//
// ivListener.registerListener(function (conditions) {
//     $(".hypothesis-iv").empty();
//     $(`#${CONDITION_ID}_preregistea .displayarea`).empty();
//     let sections = {}
//     sections[CONDITION_ID] = $(`#condition_preregistea .displayarea`);
//     sections[ANALYSIS_ID] = $(`#analysis_preregistea .displayarea .hypothesis-iv`);
//     populateCards(CONDITION_ID, sections, conditions);
//     updateTeaCodeVariables();
// });
//
// hypothesisPairListener.registerListener(function(pair) {
//     const inputArea = $(`#analysis_preregistea .inputarea`);
//     inputArea.empty();
//
//     if(pair['dv'] !== '' && pair['iv'] !== '') {
//         updateHypothesisFormArea(pair, inputArea);
//     } else {
//         inputArea.append("Please add some value here");
//     }
// })
