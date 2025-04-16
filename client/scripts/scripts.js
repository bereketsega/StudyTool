function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getApiUrl() {
  try {
    const response = await fetch("config/config.json");
    const config = await response.json();
    const keys = config.find((item) => "API_URL" in item);
    if (!keys || !keys.API_URL) {
      console.warn("API URL is missing in config.json");
      return null;
    }
    return keys.API_URL;
  } catch (error) {
    console.error("Error reading API URL from config.json:", error.message);
    return null;
  }
}

const form = document.getElementById("uploadForm");

//  event listener for file submission
form.addEventListener("submit", async (event) => {
  clearQuestions();
  event.preventDefault();
  const questionContainer = document.getElementById("quizForm");
  if (questionContainer.textContent != "") {
    questionContainer.style.display = "none";
  }

  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a PowerPoint file.");
    return;
  }

  const apiUrl = await getApiUrl();
  if (!apiUrl) {
    throw new Error("API URL could not be retrieved.");
  }
  try {
    const loading = document.getElementById("loadingContainer");
    loading.style.display = "flex";
    const base64 = await readFileAsBase64(file);
    const response = await fetch(
      `${apiUrl}/api/gemini/generate-multiple-choice`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: base64 }),
      },
    );
    let parsed = await response.json();
    parsed = parsed.message;
    loading.style.display = "none";
    questionContainer.style.display = "block";

    const container = document.getElementById("questionContainer");

    parsed.forEach((q, index) => {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "20px";
      wrapper.classList.add("question-block");

      const questionEl = document.createElement("div");
      questionEl.textContent = `${index + 1}. ${q.question}`;
      questionEl.style.fontSize = "1rem";
      questionEl.style.fontWeight = "bold";
      questionEl.style.color = "#00144d";
      wrapper.appendChild(questionEl);

      q.options.forEach((option, i) => {
        const label = document.createElement("label");
        label.style.display = "block";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `question-${index}`;
        input.value = option;

        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        wrapper.appendChild(label);
      });

      // Store answer in data attribute for later
      wrapper.dataset.correctAnswer = q.answer;

      container.appendChild(wrapper);
    });

    if (document.querySelectorAll(".question-block").length > 0) {
      document.getElementById("submitButton").style.display = "block";
    }

    // Handle form submission
    document.getElementById("quizForm").addEventListener("submit", (e) => {
      e.preventDefault();

      const blocks = document.querySelectorAll(".question-block");

      blocks.forEach((block, idx) => {
        const selected = block.querySelector('input[type="radio"]:checked');
        const correct = block.dataset.correctAnswer;

        const labels = block.querySelectorAll("label");

        labels.forEach((label) => {
          const input = label.querySelector("input");
          const text = label.textContent;

          // Reset styles
          label.classList.remove("correct", "incorrect");
          if (input.checked) {
            if (input.value === correct) {
              label.classList.add("correct");
            } else {
              label.classList.add("incorrect");
            }
          }

          // Mark the correct one regardless of user's choice
          if (input.value === correct) {
            label.classList.add("correct");
          }
        });
      });
    });
  } catch (err) {
    loading.style.display = "none";
    console.error("Error uploading file:", err);
    alert("Failed to process file");
  }
});

function clearQuestions() {
  const quizForm = document.getElementById("quizForm");
  quizForm.reset();
  const questionContainer = document.getElementById("questionContainer");
  questionContainer.innerHTML = "";
  document.getElementById("submitButton").style.display = "none";
}
