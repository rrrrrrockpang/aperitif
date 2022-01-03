# Deploy the website
This website is deployed on https://preregistration-experiment.herokuapp.com/ as the experiment to test the usefulness of Aperitif.

We stored the input data in [MongoDB](https://docs.mongodb.com/guides/server/drivers/). We implemented the website just because users might have concern/conflict with creating a (new) AsPredicted account and downloading unwanted Chrome extension. We simply injected our JS, CSS, HTML code to [AsPredicted](https://aspredicted.org/) interface. The logic are the same in the Chrome extension itself at the `extension` folder. 

#### Start the app locally

```
cd ./website
heroku local:start
```

If you run into issue, please see https://devcenter.heroku.com/articles/heroku-local#run-your-app-locally-using-the-heroku-local-command-line-tool, or contact the author. 

#### Create a Heroku app

You can also deploy our website and see how it works remote, or simply go to our website from above. 

```
heroku create

# Rename is necessary
heroku rename heroku NAME

git push heroku main
```

If you run into any issue, see https://devcenter.heroku.com/articles/git.

See [here](https://github.com/rrrrrrockpang/aperitif#deploy-the-website) for more.