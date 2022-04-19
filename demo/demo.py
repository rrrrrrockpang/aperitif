import tea

data_path = "./backend/ar_tv_long_empty.csv"
tea.data(data_path, key='ID')

variables = [
	{
		"name": "time",
		"data type": "ratio"
	},
	{
		"name": "browser",
		"data type": "nominal",
		"categories": [
			"Firefox",
			"Chrome"
		]
	}
]
tea.define_variables(variables)

study_design = {
	"study type": "experiment",
	"independent variables": [
		"browser"
	],
	"dependent variables": [
		"time"
	]
} 

tea.define_study_design(study_design) 

assumptions = {
    'groups normally distributed': [['browser', 'time']]
    
}
tea.assume(assumptions, mode='relaxed')

tea.hypothesize(["browser","time"], ["browser: Chrome > Firefox"])