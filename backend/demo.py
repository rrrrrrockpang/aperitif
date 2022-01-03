# This is a demo script that uses Tea to generate proper statistic tests for 
# experimental preregistration, Tea also handles full dataset 
# See more at http://tea-lang.org/

import tea  

#data_path = "./static/ar_tv_long_empty.csv"
data_path = "./static/ar_tv_long.csv"
variables = [
    {
        'name': 'ID',
        'data type': 'ratio'
    },
    {
        'name': 'Condition',
        'data type': 'nominal',
        'categories': ['AR', 'TV']
    },
    {
        'name': 'Score',
        'data type': 'ordinal',
        'categories': [1,2,3,4,5]
    }
]
experimental_design = {
    'study type': 'experiment',
    'independent variables': 'Condition',
    'dependent variables': 'Score'
}
assumptions = {
    'Type I (False Positive) Error Rate': 0.01969
}
tea.data(data_path, key='ID')
tea.define_variables(variables)
tea.define_study_design(experimental_design)
tea.assume(assumptions)
results = tea.hypothesize(['Score', 'Condition'], ['Condition:AR > TV'])