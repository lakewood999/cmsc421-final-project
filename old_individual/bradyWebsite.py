
# I'm trying to make a website for reddit analysis
# We are probbaly gonna go along a JavaScript route rather than Flask

from flask import Flask
from flask import request
from markupsafe import escape
from bradyMain import build_df
#import os

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route('/', methods=["GET","POST"])
def index():
    errors=""
    if request.method == "POST":
        if not request.form["query"].isascii():
            errors += "<p> {!r} is an invalid search query. Please use ASCII only.</p>\n".format(request.form["query"])
        else:
            results, tests, complete = build_df(request.form["query"])
            if complete:
                # results format: found_str, rep_str, post_str
                return '''
                    <html>
                        <body>
                            <p>{found}</p>
                            <p>{rep}</p>
                            <p>{post}</p>
                            <p>{test}</p>
                            <p><a href="/">Click here to analyze a different topic.</a>
                        </body>
                    </html>
                '''.format(found=escape(results[0]), rep=escape(results[1]), post=escape(results[2]), test=escape(tests[0]))
            else:
                # results format: excp
                return '''
                    <html>
                        <body>
                            <p>The search failed due to {result}</p>
                            <p><a href="/">Click here to analyze again.</a>
                        </body>
                    </html>
                '''.format(result=escape(results))
    else:
        return '''
            <html>
                <body>
                {errors}
                    <p>What topic do you want to see Reddit's overall opinion of?</p>
                    <form method="post" action=".">
                        <p><input name = "query" /></p>
                        <p><input type="submit" value="Analyze" /></p>
                    </form>
                </body>
            </html>
        '''.format(errors=escape(errors))

