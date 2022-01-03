## Backend

* The backend server of Apéritif is in Python with [Flask](https://flask.palletsprojects.com/en/2.0.x/).

* To run the backend server, make sure you have Python 3 and flask installed on your computer. Additionally, you need [tealang](https://tea-lang.org/). 

* You also need to configure your github account with your username, repo, and personal access [token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

* Update both [MongoDB](https://www.mongodb.com/) and GitHub information in `main.py`. Get personal access token to your GitHub referring to [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).


```
source venv/bin/activate

pip install -r requirements.txt

export FLASK_APP=main
flask run

# Alternatively, you can run the command below
# Just make sure your local port is not occupied. 
python main.py 
```