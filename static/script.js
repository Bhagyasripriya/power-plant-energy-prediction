const predictBtn = document.getElementById("predictBtn");

let predictionChart = null;

predictBtn.addEventListener("click", async () => {
    const at = document.getElementById("at").value;
    const v = document.getElementById("v").value;
    const ap = document.getElementById("ap").value;
    const rh = document.getElementById("rh").value;

    const errorMessage = document.getElementById("errorMessage");

    if (!at || !v || !ap || !rh) {
        errorMessage.textContent = "Please enter all input values.";
        return;
    }

    errorMessage.textContent = "";
    predictBtn.disabled = true;
    predictBtn.textContent = "Predicting...";

    const startTime = performance.now();

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                AT: parseFloat(at),
                V: parseFloat(v),
                AP: parseFloat(ap),
                RH: parseFloat(rh)
            })
        });

        const result = await response.json();

        if (!result.success) {
            errorMessage.textContent = result.error || "Prediction failed.";
            return;
        }

        const endTime = performance.now();
        const predictionTime = ((endTime - startTime) / 1000).toFixed(2);

        const prediction = Number(result.prediction);

        // Main prediction
        document.getElementById("predictionValue").textContent =
            prediction.toFixed(2);

        // Prediction summary
        document.getElementById("summaryAT").textContent =
            `${at} °C`;

        document.getElementById("summaryV").textContent =
            `${v} cm Hg`;

        document.getElementById("summaryAP").textContent =
            `${ap} mbar`;

        document.getElementById("summaryRH").textContent =
            `${rh} %`;

        document.getElementById("predictionTime").textContent =
            `${predictionTime} sec`;

        document.getElementById("summaryPE").textContent =
            `${prediction.toFixed(2)} MW`;

        updateChart(prediction);

    } catch (error) {
        errorMessage.textContent =
            "Unable to connect to the prediction server.";
        console.error(error);
    } finally {
        predictBtn.disabled = false;
        predictBtn.textContent = "⚡ Predict Energy Output";
    }
});


function updateChart(prediction) {
    const canvas = document.getElementById("predictionChart");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    // Simple demo comparison around the live prediction
    const predictedValues = [
        prediction - 3.2,
        prediction - 1.4,
        prediction + 2.1,
        prediction - 0.8,
        prediction + 1.7,
        prediction
    ];

    const actualValues = [
        prediction - 2.5,
        prediction - 0.9,
        prediction + 1.5,
        prediction - 1.2,
        prediction + 2.3,
        prediction + 0.6
    ];

    if (predictionChart) {
        predictionChart.destroy();
    }

    predictionChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: [
                "Sample 1",
                "Sample 2",
                "Sample 3",
                "Sample 4",
                "Sample 5",
                "Current"
            ],

            datasets: [
                {
                    label: "Actual Output",
                    data: actualValues,
                    borderColor: "#2d73ea",
                    backgroundColor: "rgba(45, 115, 234, 0.08)",
                    borderWidth: 2,
                    tension: 0.35,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: "Predicted Output",
                    data: predictedValues,
                    borderColor: "#7a67d8",
                    backgroundColor: "rgba(122, 103, 216, 0.08)",
                    borderWidth: 2,
                    tension: 0.35,
                    pointRadius: 3,
                    fill: false
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "top"
                }
            },

            scales: {
                y: {
                    title: {
                        display: true,
                        text: "Energy Output (MW)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Prediction Samples"
                    }
                }
            }
        }
    });
}