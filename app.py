from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

model = joblib.load("optimized_power_plant_model.joblib")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        at = float(data["AT"])
        v = float(data["V"])
        ap = float(data["AP"])
        rh = float(data["RH"])

        input_data = pd.DataFrame({
            "AT": [at],
            "V": [v],
            "AP": [ap],
            "RH": [rh]
        })

        prediction = model.predict(input_data)[0]

        return jsonify({
            "success": True,
            "prediction": round(float(prediction), 2)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)