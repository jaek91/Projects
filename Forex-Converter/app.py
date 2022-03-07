from flask import Flask, request, render_template
from forms import validate_amount_type, validate_curr_from, validate_curr_to, calc_converted_curr

app = Flask(__name__)
app.config['SECRET_KEY'] = "secret-key"

@app.route("/")
def index():
    """Shows home page with related forms"""
    return render_template("index.html")

@app.route('/form-check', methods =["POST"])
def form_inputs_validate():
    """Validates the inputs from the form and renders appropriate html template"""
    if request.method == "POST":
        
        curr_from = request.form["curr-from"]
        curr_to = request.form["curr-to"]
        amount = request.form["amount"]

        valid_curr_from = validate_curr_from(curr_from)
        valid_curr_to = validate_curr_to(curr_to)
        valid_amount_type = validate_amount_type(amount)
    
        ## initialize the err msgs to update later
        err_msgs = {"curr_from": None, "curr_to": None, "amount": None}

        if not valid_curr_from or not valid_curr_to or not valid_amount_type:
            if not valid_curr_from:
                err_curr_from = f"Invalid Country Code: {curr_from}"
                err_msgs["curr_from"] = err_curr_from
            if not valid_curr_to:
                err_curr_to = f"Invalid Country Code: {curr_to}"
                err_msgs["curr_to"] = err_curr_to
            if not valid_amount_type:
                err_amount = "Invalid Amount"
                err_msgs["amount"] = err_amount

        converted_result = calc_converted_curr(curr_from,curr_to,amount)

        if err_msgs:
            return render_template("index.html", errors = err_msgs, conv_result = converted_result)
        else:
            return render_template("index.html", conv_result = converted_result)
    




