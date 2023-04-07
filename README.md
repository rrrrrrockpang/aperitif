# Apéritif

## Apéiritf: Scaffolding Preregistration to Automatically Generate Analysis Code and Methods Descriptions

Apéritif is a research prototype that builds on top of the [AsPredicted](https://aspredicted.org/) preregistration template. The core idea is an initial attempt to connect preregisteration to later experimental stages such as data analysis and methods descriptions, using existing study design tools such as [Tea](https://github.com/tea-lang-org/tea-lang) and [Touchstone2](https://www.touchstone2.org/). 

While it can be used for simple study designs, Apéritif remains a prototype that can be used to answer additional research questions in the future.  Note that Apértif does have several limitations stated in our paper (e.g., only supports simple experiments with one independent variable). How to best formalize complex hypotheses, especially during the preregistration stage, is still under [exploration](https://arxiv.org/pdf/2104.02712.pdf). 

This is the code repository for Apéritif development. However, please refer to the [OSF research repository](https://osf.io/tgacn/?view_only=cd81b7c90092458a95c25c49ec469f0f) if you are interested in the supplementary materials for our research paper. If you run into problems, feel free to open an issue, or email ypang2@cs.washington.edu.

You can try it on this [demo website](https://aperitif-prototype.herokuapp.com/). At the end of the preregistration, you can log in to your Github and Apéritif will create a new repository named "Aperitif-Preregistration-Demo". So be sure to check it out afterward. In the demo, we replicated the AsPredicted interface solely for demonstration purposes. If you intend to use AsPredicted developed by the Wharton Credibility Lab, please go to the official website: https://aspredicted.org/!


## Backend

* The backend server of Apéritif is in Python with [Flask](https://flask.palletsprojects.com/en/2.0.x/).

* To run the backend server, make sure you have Python 3 and flask installed on your computer. Additionally, you need [tealang](https://tea-lang.org/) for statistical analysis and [statsmodel](https://www.statsmodels.org/) for power analysis. 

* You also need to configure your Github account with your username, repo, and personal access [token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

* Update both MongoDB and GitHub information in `main.py`


```
source venv/bin/activate

pip install -r requirements.txt

export FLASK_APP=main
flask run

# Alternatively, you can run the command below
# Just make sure your local port is not occupied. 
python main.py 
```

## Install the Chrome Plugin

Clone this repository or download the zip file

### Load the plugin on your Chrome browser

* Click `extensions` under `More Tools` on the top right of your Chrome browser.

<img src="./images/more_tools.png" width="220">

* Click `Load unpacked` at the top left of the Extension page. Then select the `extension` folder under the repository/zip file you just downloaded. 

<img src="./images/Aperitif.png" width="350">

### Use the Plugin on AsPredicted.org

* Create an AsPredicted account if you don't have one.
* Go to https://aspredicted.org/create.php.
* Give access to Apéritif extension on Chrome. 

  <img src="./images/access.png" width="350">
* Start use Apéritif to preregister your first study

## Related Work

We appreciate the inspiration from many great study design tools/tutorials. More projects about experiment design and automation include: 
* [Tea](https://dl.acm.org/doi/10.1145/3332165.3347940) (automatically detect statistical tests in Python)

* [Tisane](https://homes.cs.washington.edu/~rjust/publ/tisane_chi_2022.pdf) (express and infer more complex statistical models, hopefully as future work to extend Apéritif)

* [Statsplorer](https://dl.acm.org/doi/10.1145/2702123.2702347) (visualize the data analysis process with data)

* [Touchstone2](https://www.touchstone2.org/) (explore tradeoffs for within experimental design)

* [StasPlayground](https://dl.acm.org/doi/10.1145/3027063.3052970) (manipulate visualization to see effects on inferential statistics)

* [Hypothesis Formalization](https://arxiv.org/pdf/2104.02712.pdf) (how people formalize hypothesis for experiments)

* [Designing for Preregistration](https://www.semanticscholar.org/paper/Designing-for-Preregistration%3A-A-User-Centered-Pu-Zhu/7557dcc3d7e0bad7bbad0644d22690136e40d87c) (a user-centered perspective to design for preregistration)

* [Argus](https://www.semanticscholar.org/paper/Argus%3A-Interactive-a-priori-Power-Analysis-Wang-Eiselmayer/5ca94c6b7198768f7cd7f295ff2a512114b1f6af) (support interactive exploration of a-priori analysis)

* [Designing, Running, and Analyzing Experiments](https://www.coursera.org/learn/designexperiments), and also the great [Quantitative Methods in Information Science](https://www.washington.edu/students/crscat/insc.html) at UW, which inspired this project. Part of the class materials are summarized [here](http://depts.washington.edu/acelab/proj/Rstats/index.html) in 2022.

Please open an Github issue if important papers and projects are missed! 

