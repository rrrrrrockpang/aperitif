import http
import json, uuid, logging
from flask import Flask, request, jsonify, render_template
from flask_mongoengine import MongoEngine

app = Flask(__name__)

# TODO: Need to define your own MongoDB URI
# See MongoDB documentation: https://docs.mongodb.com/guides/server/drivers/
# See MongoEngine that was implemented here: http://mongoengine.org/
DB_URI = ""

# app.config['MONGODB_SETTINGS'] = {
#     'db': 'example',
#     'host': 'localhost',
#     'port': 27017
# }
app.config['MONGODB_HOST'] = DB_URI

app.config["CACHE_TYPE"] = "null"

db = MongoEngine()
db.init_app(app)

preregis_input = None

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
            "python_code": self.python_code,
            "tea_code": self.tea_code
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
    logging.warning(record)
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
        python_code=record["python_code"],
        tea_code=record["tea_code"]
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


@app.route('/')
def index():
    return render_template("instruction.html")

@app.route('/study')
def study():
    return render_template("index.html")

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/update_input", methods=["POST"])
def update_input():
    data = json.loads(request.data)
    global preregis_input
    preregis_input = data["preregistration"]

    return {"status": "ok"}

@app.route("/display")
def display():
    preregistration = preregis_input
    if preregistration is None:
        return {"status": "no input"}

    return render_template("example.html",
                           title='Result',
                           question_1=preregistration['question_1'],
                           question_2=preregistration['question_2'],
                           question_3=preregistration['question_3'],
                           question_4=preregistration['question_4'],
                           question_5=preregistration['question_5'],
                           question_6=preregistration['question_6'],
                           question_7=preregistration['question_7'])


@app.route('/create', methods=['PUT'])
def createRecord():
    logging.warning("Creating Record ...")
    data = json.loads(request.data)
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