from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image, ImageFilter, ImageEnhance
import io
import openai
import os

print("TESSDATA_PREFIX:", os.getenv("TESSDATA_PREFIX"))

pytesseract.pytesseract.tesseract_cmd = "/app/.apt/usr/bin/tesseract"
tessdata_dir_config = (
    '--tessdata-dir "/app/.apt/usr/share/tesseract-ocr/4.00/tessdata/"'
)

app = Flask(__name__)
CORS(app)

# Ensure you have set the OPENAI_API_KEY in your environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")


def ocr_image_and_apply_filter(image_bytes):
    # Load the image from bytes
    image = Image.open(io.BytesIO(image_bytes))

    # Convert image to grayscale
    image = image.convert("L")

    # Enhance the image contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)

    # Apply a threshold to make the image appear more like black and white
    image = image.point(lambda x: 0 if x < 128 else 255, "1")

    # Optionally, apply more filters if needed (e.g., image.filter(ImageFilter.SHARPEN))

    # Perform OCR using Tesseract, specifying English and Korean languages
    text = pytesseract.image_to_string(
        image, lang="eng+kor", config=tessdata_dir_config
    )

    return text


import openai


def analyze_text_with_openai(text, difficulty_level):
    # Define the instruction based on the difficulty level
    if difficulty_level == "상":
        audience = "고등학생들"
    elif difficulty_level == "중":
        audience = "중학생 (middle school student)"
    else:  # Assuming '하' is the default or any other input is considered the lowest level
        audience = "4세 어린이"

    # Craft the prompt with the specified audience and instruction for summarization
    prompt = f"""
    다음 텍스트를 {audience}가 읽기 쉽게 어려운 용어들을 제거하거나 쉽게 설명하며 뉴스를 이해하기 쉽게 3줄 요약 해주세요.
    This program is going through a script so just give me the three summarized lines in bulletin.
    show the summary in 1. 2. 3. format.
    텍스트: "{text}"

    예시
    상:데이터 분석하고 결과까지 사용하세요, 어려운 단어는 가끔 써주세요
    중: 데이터분석을 쉽게 쉽게 표햔해주세요, 어려운단어는 자주쓰지마세요
    하: 데이터분석을 아예 하지 말아주고 결론만 아주아주 쉽게 얘기해주세요. 어려운단어는 절대 쓰지마세요
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-4-0125-preview",  # Adjust the model as necessary
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                },  # Changed role to "user" to fit the use case
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return "Error during OpenAI processing."


@app.route("/test-cors")
def test_cors():
    return "CORS should be enabled for this response!"


@app.route("/process-image", methods=["POST"])
def process_image():
    if "image" not in request.files:
        return jsonify({"error": "No image part"}), 400

    difficulty_level = request.form.get(
        "level", "중"
    )  # Default to "중" if not provided
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected image"}), 400

    if file:
        ocr_text = ocr_image_and_apply_filter(file.read())
        openai_summary = analyze_text_with_openai(ocr_text, difficulty_level)
        return jsonify({"ocr_text": ocr_text, "openai_summary": openai_summary})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
