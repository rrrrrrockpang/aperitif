import tea

# Declare and annotate the variables of interest
variables = [
    {
        'name' : 'So',
        'data type' : 'nominal',
        'categories' : ['0', '1']
    },
    {
        'name' : 'Prob',
        'data type' : 'ratio',
        'range' : [0,1]
    }
]
experimental_design = {
                        'study type': 'observational study',
                        'contributor variables': 'So',
                        'outcome variables': 'Prob',
                    }
assumptions = {
    'Type I (False Positive) Error Rate': 0.05,
    'groups normally distributed': [['Prob', 'So']]
}

data_path = '' # WRITE WHERE YOUR DATA IS HERE
tea.data(data_path)
tea.define_variables(variables)
tea.define_study_design(experimental_design) 
tea.assume(assumptions)
tea.hypothesize(['So', 'Prob'], ['So:1 > 0'])  ## Southern is greater
