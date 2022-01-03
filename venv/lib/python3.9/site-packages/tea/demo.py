import tea
variables = [
    {
        'name' : 'So', # Southern 
        'data type': 'nominal',
        'categories': ['0','1']
    },
    {
        'name': 'Prob',
        'data type': 'ratio',
        'range': [0,1]
    }
] 
experimental_design = {
        'study type': 'observational study',
        'contributor variables': 'So',
        'outcome variables': 'Prob'
}
assumptions = {
    'Type 1 (False Positive) Error Rate': 0.05,
}

tea.data('.tea/UScrime.csv')
tea.define_variables(variables)
tea.define_study_design(experimental_design)
tea.assume(assumptions)
tea.hypothesize(['So','Prob'], ['So:1>0']) # Southern is greater
