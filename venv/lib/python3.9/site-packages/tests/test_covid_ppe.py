import tea

variables = [
    {
        'name': 'Checked',
        'data type': 'nominal',
        'categories': ['not checked', 'checked']
    },
    {
        'name': 'Affiliation Uni',
        'data type': 'nominal',
        'categories': ['0', '1']
    }
]

study_design = {
    'study type': 'observational study',
    'contributor variables': ['Affiliation Uni'],
    'outcome variables': 'Checked',
}

assumptions = {'alpha': 0.05}


tea.data("./tests/data/v3_data.csv")
tea.define_variables(variables)
tea.define_study_design(study_design)
tea.assume(assumptions)
tea.hypothesize(["Affiliation Uni", "Checked"], ["Affiliation Uni:1 > 0"])
# tea.define_study_design(study_design)
# tea.assume(assumptions)
# tea.hypothesize(['Affiliation Uni', 'Checked'], ['Affiliation Uni:1 > 0'])