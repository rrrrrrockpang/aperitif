from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_cors import CORS, cross_origin
from statsmodels.stats.power import TTestPower, TTestIndPower, FTestAnovaPower, FTestPower, NormalIndPower
from flask_dance.contrib.github import make_github_blueprint, github
import json, requests, logging
import base64

app = Flask(__name__)
CORS(app)
app.config["CACHE_TYPE"] = "null"
app.config["SECRET_KEY"] = "aperitif"  

# Update this to deploy
github_blueprint = make_github_blueprint(
    client_id='', 
    client_secret='', 
    scope='repo,user',
    redirect_url="/default")
app.register_blueprint(github_blueprint, url_prefix='/github_login')

## MongoDB configuration
# TODO: Need to define your own MongoDB URI
# See MongoDB documentation: https://docs.mongodb.com/guides/server/drivers/
# See MongoEngine that was implemented here: http://mongoengine.org/
DB_URI = ""
app.config['MONGODB_HOST'] = DB_URI

db = MongoEngine()
db.init_app(app)
preregis_input = None

## Github Configuration
# Username, repo name, and personal access token
# To create a personal access token, follow
# https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
OWNER = ""
REPO = ""
TOKEN = "" 

# Placeholder header csv as input to Tea
DATA_DIR = "static"
HEADER_CSV = "header.csv" 

# prevent cached responses
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response

def create_new_repo():
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0",
        "Authorization": "token {}".format(github_blueprint.token['access_token'])
    }
    data = {
        "name": "Aperitif Preregistration Demo", 
        "private": "false",
        "has_wiki": "true"
    }
    response = github.post(headers=headers, json=data, url="/user/repos")
    data = response.json()

    if response.ok: return True, response.json()
    return False, ""

@app.route("/github", methods=['GET', 'POST'])
def connect_to_github():
    if not github.authorized:
        return jsonify({'success': 'login'})
    success, response = create_new_repo()
    if success:
        return jsonify({'success': 'true', 'owner': response['owner']['login'], 'name': response['name']})
    else:
        return jsonify({'success': 'false'})


@app.route('/hello_world')
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/loginHere")
def loginHere():
    return redirect(url_for("github.login"))
    # return '''<a href="javascript:window.open('','_self').close();">Close Tab</a>'''
@app.route("/default")
def default():
    return '''<p>You are logged in. Please <a href="javascript:window.open('','_self').close();">close this tab</a>, and click "Push Your Artifacts to Github" in the previous page.</p>'''

#### Select Test ####
def get_variables(input):
    """
    Get variables from API Request Messsage
    """
    variables = input['variables']

    # Add a row index
    is_duplicate = False
    for v in variables:
        if v['name'].lower ==  'id':
            is_duplicate = True
            break
    if not is_duplicate: 
        variables.append({
            'name': 'ID',
            'data type': 'ratio'
        })
    return input['variables']


def get_study_design(input):
    """
    Get study design from API Request Messsage
    """
    return input['study_design']


def get_assumption(input):
    """
    Assumptions are optional to run Tea that reasons the correct statistical test
    Optional default assumptions for using Tea for preregistration.
    See more about assumptions on full dataset: http://tea-lang.org/ 
    """
    return {
        'Type I (False Positive) Error Rate': 0.05
    }


def get_hypothesis(input):
    """
    Get variables and relationship nested in the hypothesis from API Request
    """
    hs = input['hypothesis']
    variables, relationship = [], []
    for h in hs:
        variables.append(h[0])
        relationship.append(h[1])
    return variables, relationship
        

def generate_dataset_header(variables):
    """
    Generate dataset header in order to reason statistical tests by Tea
    """
    headers = [] # start with ID in each row
    # Populate all variables in the header
    for v in variables:
        headers.append(v['name'])

    with open("{}/{}".format(DATA_DIR, HEADER_CSV), 'w', encoding='UTF8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)

def run_tea_code(input):
    """
    Handle API Request message and construct tea code 
    Source: http://tea-lang.org/
    Return: the correct method
    """
    # Define variables for Tea
    variables = get_variables(input)
    study_design = get_study_design(input)
    assumptions = get_assumption(input)
    hypothesis_vars, hypothesis_rel = get_hypothesis(input)

    # In order to proceed, tea needs to have a dataset
    generate_dataset_header(variables)

    # Run Tea
    data_path = "{}/{}".format(DATA_DIR, HEADER_CSV)
    tea.data(data_path, key='ID')
    
    tea.define_variables(variables)
    tea.define_study_design(study_design)
    tea.assume(assumptions) 

    # In case for multiple hypothesis
    results = []
    for index, var_pair in enumerate(hypothesis_vars):
        var_rel = hypothesis_rel[index]
        results.append(tea.hypothesize(var_pair, var_rel))
    return results

def calc_power(sample_size, effect_size, alpha, method, k_groups):
    if method == "Paired-samples t-test" or method == "Wilcoxon signed-rank test":
        return TTestPower().power(effect_size=effect_size, 
                                    nobs=sample_size, 
                                    alpha=alpha, alternative="larger")
    elif method == "Independent samples t-test" or method == "Mann-Whitney U test" or method == "Welch's t-test":
        return TTestIndPower().power(effect_size=effect_size, 
                                    nobs1=sample_size, 
                                    alpha=alpha, alternative="larger")
    elif method == "One-way ANOVA" or method == "Kruskal-Wallis test":
        return FTestAnovaPower().power(effect_size=effect_size, 
                                    nobs=sample_size, 
                                    alpha=alpha, k_groups=k_groups) # TODO: Figure out this k_groups
    elif method == "One-way repeated measures ANOVA" or method == "Friedman test":
        # definition of df_num, df_denom: https://courses.lumenlearning.com/introstats1/chapter/the-f-distribution-and-the-f-ratio/
        # Implementation: https://stackoverflow.com/questions/64420111/how-can-i-get-the-ftest-solve-power-methods-in-statsmodel-to-compute-power-for
        return FTestPower().solve_power(effect_size=effect_size,
                                    alpha=alpha, df_num=sample_size-k_groups, nobs=sample_size, df_denom=(k_groups), ncc=0)
    else:
        return NormalIndPower().power(effect_size=effect_size, alpha=alpha, nobs1=sample_size, ratio=1, alternative="larger")
    

@app.route("/getMethod", methods=["GET", "POST"])
def get_method():
    # print(request.data)
    data = json.loads(request.data)
    methods = run_tea_code(data)
    return jsonify({'methods': methods})

@app.route("/getSamples", methods=["GET", "POST"])
def get_sample():
    data = json.loads(request.data)
    effect_size = data["effectSize"]
    alpha = data["alpha"]
    confidence = data['confidence']
    method = data["method"]
    k_groups = data['nlevels']
    lower, higher = 5, 300
    lst = []
    for point in range(lower, higher + 1):
        lst.append({
            "sample": point,
            "power": calc_power(point, effect_size, alpha, method, k_groups),
            "lower": calc_power(point, effect_size - confidence, alpha, method, k_groups),
            "higher": calc_power(point, effect_size + confidence, alpha, method, k_groups)
        })
    
    return jsonify({'data': lst})


def push_file(owner, name, text, file):
    string_bytes = text.encode("utf-8")
    base64_bytes = base64.b64encode(string_bytes)
    base64_string = base64_bytes.decode("utf-8")


    query_url = "https://api.github.com/repos/{}/{}/contents/{}".format(
        owner, name, file
    )

    headers = {
        'Authorization': 'Bearer {}'.format(github_blueprint.token['access_token']), 
        'Content-Type': 'application/json'
    }

    data = {
        "message": "Initialize Preregistration with Aperitif",
        "content": base64_string
    }
    r = requests.put(query_url, headers=headers, data=json.dumps(data))
    # Print response message
    print(r.json())


def get_preregistration_str(data):
    return "## 2) **Hypothesis** What's the main question being asked or hypothesis being tested in this study?   \n{}   \n".format(data['question_1']) + \
    "## 3) **Dependent variable** Describe the key dependent variable(s) specifying how they will be measured.   \n{}   \n".format(data['question_2']) + \
    "## 4) **Conditions** How many and which conditions will participants be assigned to?   \n{}   \n".format(data['question_3']) + \
    "## 5) **Analyses** Specify exactly which analyses you will conduct to examine the main question/hypothesis.   \n{}   \n".format(data['question_4']) + \
    "## 6) **Outliers** and Exclusions Describe exactly how outliers will be defined and handled, and your precise rule(s) for excluding observations.   \n{} \n".format(data['question_5']) + \
    "## 7) **Sample Size** How many observations will be collected or what will determine sample size?   \n{} \n".format(data['question_6']) + \
    "## 8) **Other** Anything else you would like to pre-register?   \n{} \n".format(data['question_7'])


def get_python_code(data):
    return data['python_code']


def get_r_code(data):
    return data['r_code']


def get_method_description(data):
    return data['text']


def push_to_github(data):
    logging.warning("Pushing to Github ...")
    preregistration = data['preregistration']
    code = data["code"]
    text = data["text"]
    owner = data['owner']
    name = data['name']
    
    push_file(owner, name, get_preregistration_str(preregistration), 'preregistration.md')
    push_file(owner, name, get_python_code(code), 'starter.py')
    push_file(owner, name, get_r_code(code), "starter.R")
    push_file(owner, name, get_method_description(text), "method.md")


@app.route("/push", methods=["PUT"])
def push():
    data = json.loads(request.data)
    push_to_github(data)
    return jsonify({'status': '200'})

#### Push to Github ###
# Construct preregistration class that holds necessary information
# Users can also push the pdf upstream 
# and information to MongoDB
class Preregistration(db.Document):
    uuid: str = db.StringField()
    question_1: str = db.StringField()
    question_2: str = db.StringField()
    question_3: str = db.StringField()
    question_4: str = db.StringField()
    question_5: str = db.StringField()
    question_6: str = db.StringField()
    question_7: str = db.StringField()

    def to_json(self):
        return {
            "uuid": self.uuid,
            "question_1": self.question_1,
            "question_2": self.question_2,
            "question_3": self.question_3,
            "question_4": self.question_4,
            "question_5": self.question_5,
            "question_6": self.question_6,
            "question_7": self.question_7,
        }


class AnalysisCode(db.Document):
    uuid: str = db.StringField()
    r_code: str = db.StringField()
    python_code: str = db.StringField()
    tea_code: str = db.StringField()

    def to_json(self):
        return {
            "uuid": self.uuid,
            "r_code": self.r_code,
            "python_code": self.python_code
        }


class ReportText(db.Document):
    uuid: str = db.StringField()
    text: str = db.StringField()

    def to_json(self):
        return {
            "uuid": self.uuid,
            "text": self.text
        }


class Record(db.Document):
    user_id: str = db.StringField()
    preregistration_id: str = db.StringField()
    code_id: str = db.StringField()
    text_id: str = db.StringField()

    def to_json(self):
        return {
            "user_id": self.uuid,
            "preregistration_id": self.text,
            "code_id": self.code_id,
            "text_id": self.text_id
        }


def createPreregistration(uuid, record):
    preregistration = Preregistration(
        uuid=uuid,
        question_1=record['question_1'],
        question_2=record['question_2'],
        question_3=record['question_3'],
        question_4=record['question_4'],
        question_5=record['question_5'],
        question_6=record['question_6'],
        question_7=record['question_7'],
    )
    logging.info("Preregistration saved ...")
    return preregistration


def createCode(uuid, record):
    code = AnalysisCode(
        uuid=uuid,
        r_code=record["r_code"],
        python_code=record["python_code"]
    )
    logging.info("Code Saved ...")
    return code


def createText(uuid, record):
    text = ReportText(
        uuid=uuid,
        text=record["text"]
    )
    logging.info("Text Saved ...")
    return text

def create_record(data):
    logging.warning("Creating Record ...")
    preregistration = data["preregistration"]
    code = data["code"]
    text = data["text"]

    user_id = str(uuid.uuid4())
    preregistration_id = str(uuid.uuid4())
    code_id = str(uuid.uuid4())
    text_id = str(uuid.uuid4())

    record = Record(
        user_id=user_id,
        preregistration_id=preregistration_id,
        code_id=code_id,
        text_id=text_id
    )
    logging.info("Record saved...")

    preregis = createPreregistration(preregistration_id, preregistration)
    code = createCode(code_id, code)
    text = createText(text_id, text)

    preregis.save()
    code.save()
    text.save()
    record.save()

    return jsonify({'status': http.HTTPStatus.OK})

if __name__ == "__main__":
    app.run()